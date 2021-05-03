/**
 * Class representing an application error.
 * @extends Error
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
 */
class ApplicationError extends Error {
  constructor({ message, statusCode }) {
    super(message);

    this.name = 'ApplicationError';
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Exposes the class representing an application error.
 * @module util/ApplicationError
 */
module.exports = ApplicationError;
