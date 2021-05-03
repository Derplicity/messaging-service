/**
 * Exposes application constants.
 * @module util/constants
 */
module.exports = {
  /**
   * The maximum number of milliseconds allowed when creating a Date.
   * @constant
   * @type {number}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
   */
  MAX_TIMESTAMP: 8640000000000000,

  /**
   * The minimum number of milliseconds allowed when creating a Date.
   * @constant
   * @type {number}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
   */
  MIN_TIMESTAMP: -8640000000000000,
};
