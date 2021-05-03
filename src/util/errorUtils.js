const { insertValueAtPath } = require('./helpers');

/**
 * Exposes application error utilities.
 * @module util/errorUtils
 * @see {@link module:util/helpers}
 */

module.exports = {
  /**
   * Formats given error for client side use.
   * @param {Object} err - The error object
   * @param {boolean} withStatus - Whether or not to return a status code
   * @returns {Object} Formatted error or formatted error and status code
   * @see {@link module:util/helpers.insertValueAtPath}
   */
  format(err, withStatus = false) {
    let formattedError;
    let status;

    // Handle mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors);
      const message = `Invalid field${errors.length > 1 ? 's' : ''}.`;

      const fields = errors.reduce(
        (obj, error) => insertValueAtPath(error.kind, error.path.split('.'), obj),
        {},
      );

      status = 400;
      formattedError = { message, fields };
    }

    // Handle mongoose duplication errors
    if (err.name === 'MongoError') {
      const { code } = err;
      const keys = Object.keys(err.keyValue);
      const message = `Invalid field${keys.length > 1 ? 's' : ''}.`;

      let fields;

      if (code === 11000) {
        fields = keys.reduce((obj, key) => insertValueAtPath('duplicate', key.split('.'), obj), {});
      }

      status = 400;
      formattedError = { message, fields };
    }

    // Handle internally created errors
    if (err.name === 'ApplicationError') {
      status = err.statusCode || 500;
      formattedError = { message: err.message };
    }

    // Last line of defense
    if (!formattedError) {
      status = 500;
      formattedError = { message: 'An unknown error occurred.' };
    }

    if (withStatus) return { formattedError, status };

    return formattedError;
  },
};
