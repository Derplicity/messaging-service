const messageHandler = require('../handlers/messages');
const {
  CREATE_MESSAGE,
  UPDATE_MESSAGE,
  ARCHIVE_MESSAGE,
  DELETE_MESSAGE,
} = require('../../config/eventTypes');

/**
 * Exposes Socket.io events for Messages which map to handlers.
 * @module api/events/messages
 * @see {@link module:api/handlers/messages}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = (socket) => {
  /**
   * Create new message
   * @see {@link module:api/handlers/messages.createMessage}
   */
  socket.on(CREATE_MESSAGE, messageHandler.createMessage);

  /**
   * Update a message by id
   * @see {@link module:api/handlers/messages.updateMessageById}
   */
  socket.on(UPDATE_MESSAGE, messageHandler.updateMessageById);

  /**
   * Archive a message by id
   * @see {@link module:api/handlers/messages.archiveMessageById}
   */
  socket.on(ARCHIVE_MESSAGE, messageHandler.archiveMessageById);

  /**
   * Delete a message by id
   * @see {@link module:api/handlers/messages.deleteMessageById}
   */
  socket.on(DELETE_MESSAGE, messageHandler.deleteMessageById);
};
