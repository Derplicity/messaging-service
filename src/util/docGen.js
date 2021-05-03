/**
 * Exposes application documentation generators.
 * @module util/docGen
 * @see {@link https://github.com/asyncapi/generator}
 */
module.exports = {
  /**
   * Generate API documentation for async API.
   * @param {string} inputFile - The input file path
   * @param {string} outputDir - The output file path
   * @returns {Promise}
   */
  async generateAsyncApiDoc(inputFile, outputDir) {
    return new Promise(async (resolve, reject) => {
      try {
        const Generator = require('@asyncapi/generator');

        const generatorOptions = {
          templateParams: { singleFile: true },
          forceWrite: true,
        };

        const generator = new Generator('@asyncapi/html-template', outputDir, generatorOptions);

        await generator.generateFromFile(inputFile);

        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
};
