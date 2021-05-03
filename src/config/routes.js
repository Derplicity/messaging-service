/**
 * Exposes application route configuration.
 * @module config/routes
 * @see {@link module:util/docGen}
 * @see {@link module:util/errorUtils}
 * @see {@link module:api/routes}
 * @see {@link ./openapi.json}
 * @see {@link https://github.com/expressjs/express}
 * @see {@link https://nodejs.org/api/path.html}
 * @see {@link https://github.com/scottie1984/swagger-ui-express}
 */

/**
 * Configure application routes.
 * @param {Application} app - The application
 * @see {@link module:util/docGen.generateAsyncApiDoc}
 */
module.exports = async (app) => {
  /* istanbul ignore next */
  if (process.env.NODE_ENV === 'development') {
    try {
      const path = require('path');
      const { generateAsyncApiDoc } = require('../util/docGen');

      const asyncApiInputFile = path.resolve(__dirname, './asyncapi.json');
      const asyncApiOutputDir = path.resolve(__dirname, '../docs/api/event-driven');

      // Generate event-driven api documentation
      await generateAsyncApiDoc(asyncApiInputFile, asyncApiOutputDir);

      // Connect event-driven api documentation route
      app.get('/api/event-driven', (req, res) => {
        res.sendFile(path.resolve(asyncApiOutputDir, 'index.html'));
      });
    } catch (err) {
      console.error(err);
    }

    // Connect rest api documentation route
    const swaggerUi = require('swagger-ui-express');
    const openApiSpec = require('./openapi.json');
    app.use('/api/rest', swaggerUi.serve, swaggerUi.setup(openApiSpec));
  }

  // Connect routes
  app.use('/api/v1', require('../api/routes'));

  const errorUtils = require('../util/errorUtils');

  // Error handler
  app.use((err, req, res, /* eslint-disable */ next /* eslint-enable */) => {
    const { formattedError, status } = errorUtils.format(err, true);

    return res.status(status).json({ error: formattedError });
  });
};
