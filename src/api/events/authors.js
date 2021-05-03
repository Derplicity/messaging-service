const authorHandler = require('../handlers/authors');
const { UPDATE_AUTHOR, ARCHIVE_AUTHOR, DELETE_AUTHOR } = require('../../config/eventTypes');

/**
 * Exposes Socket.io events for Authors which map to handlers.
 * @module api/events/authors
 * @see {@link module:api/handlers/authors}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = (socket) => {
  /**
   * Update an author by id
   * @see {@link module:api/handlers/authors.updateAuthorById}
   */
  socket.on(UPDATE_AUTHOR, authorHandler.updateAuthorById);

  /**
   * Archive an author by id
   * @see {@link module:api/handlers/authors.archiveAuthorById}
   */
  socket.on(ARCHIVE_AUTHOR, authorHandler.archiveAuthorById);

  /**
   * Delete an author by id
   * @see {@link module:api/handlers/authors.deleteAuthorById}
   */
  socket.on(DELETE_AUTHOR, authorHandler.deleteAuthorById);
};
