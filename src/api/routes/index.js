const { Router } = require('express');

/**
 * Exposes Express endpoints.
 * @module api/routes
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = Router()
  /**
   * Author Endpoints
   * @see {@link module:api/routes/authors}
   */
  .use('/authors', require('./authors'))

  /**
   * Room Endpoints
   * @see {@link module:api/routes/rooms}
   */
  .use('/rooms', require('./rooms'))

  /**
   * Message Endpoints
   * @see {@link module:api/routes/messages}
   */
  .use('/messages', require('./messages'));
