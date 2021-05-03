const { v4: uuidv4, validate: uuidValidate, version: uuidVersion } = require('uuid');

/**
 * Exposes functions relating to UUID.
 * @module util/uuid
 * @see {@link https://github.com/uuidjs/uuid}
 */
module.exports = {
  /**
   * Generate a new version 4 UUID.
   * @returns {string} The new UUID
   */
  generate() {
    return uuidv4();
  },

  /**
   * Validate a version 4 UUID.
   * @param {string} uuid - The UUID
   * @returns {boolean} If the UUID is valid
   */
  validate(uuid) {
    return uuidValidate(uuid) && module.exports.version(uuid) === 4;
  },

  /**
   * Get the version of the UUID.
   * @param {string} uuid - The UUID
   * @returns {number} The version of the UUID
   */
  version(uuid) {
    return uuidVersion(uuid);
  },
};
