/**
 * Exposes application helper functions.
 * @module util/helpers
 */
module.exports = {
  /**
   * Recursively add a value to an object given a path array.
   * @param {any} value - The value to add to the object
   * @param {string[]} pathArray - The path to the location to store the value
   * @param {Object} [obj] - The object to add the value to
   * @returns {Object} Modified object
   */
  insertValueAtPath(value, pathArray, obj = {}) {
    const newObj = obj;
    const pathPart = pathArray.shift();

    if (!pathArray.length) {
      newObj[pathPart] = value;
      return newObj;
    }

    if (newObj[pathPart] === undefined) {
      newObj[pathPart] = {};
    }

    newObj[pathPart] = module.exports.insertValueAtPath(value, pathArray, newObj[pathPart]);

    return newObj;
  },

  /**
   * Check if an array has duplicates.
   * @param {Array} arr - The array
   * @returns {boolean} If array has duplicates
   */
  arrayHasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
  },
};
