const { Router } = require('express');
const {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageById,
  deleteMessageById,
  archiveMessageById,
} = require('../controllers/messages');

/**
 * Exposes Express endpoints for Messages which map to controller handlers.
 * @module api/routes/messages
 * @see {@link module:api/controllers/messages}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = Router()
  /**
   * Create new message
   * @see {@link module:api/controllers/messages.createMessage}
   */
  .post('/', createMessage)

  /**
   * Get all messages
   * @see {@link module:api/controllers/messages.getAllMessages}
   */
  .get('/', getAllMessages)

  /**
   * Get a message by id
   * @see {@link module:api/controllers/messages.getMessageById}
   */
  .get('/:messageId', getMessageById)

  /**
   * Update a message by id
   * @see {@link module:api/controllers/messages.updateMessageById}
   */
  .put('/:messageId', updateMessageById)

  /**
   * Archive a message by id
   * @see {@link module:api/controllers/messages.archiveMessageById}
   */
  .put('/:messageId/archive', archiveMessageById)

  /**
   * Delete a message by id
   * @see {@link module:api/controllers/messages.deleteMessageById}
   */
  .delete('/:messageId', deleteMessageById);
