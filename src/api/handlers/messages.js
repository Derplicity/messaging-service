const ApplicationError = require('../../util/ApplicationError');
const messageRepository = require('../../data/repositories/message');
const roomRepository = require('../../data/repositories/room');
const errorUtils = require('../../util/errorUtils');

const {
  MESSAGE_ARCHIVED,
  MESSAGE_CREATED,
  MESSAGE_DELETED,
  MESSAGE_UPDATED,
} = require('../../config/eventTypes');

/**
 * Exposes handlers for Message events.
 * @module api/handlers/messages
 * @see {@link module:data/repositories/message}
 * @see {@link module:data/repositories/room}
 * @see {@link module:util/ApplicationError}
 * @see {@link module:util/errorUtils}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = {
  /**
   * Create a new Message.
   * @param {Object} requestParams - Request Parameters
   * @param {Object} requestParams.creationValues - Creation values
   * @param {string} requestParams.creationValues.roomId - Room id
   * @param {string} requestParams.creationValues.authorId - Author id
   * @param {string} requestParams.creationValues.text - Message text
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/message.createMessage}
   * @see {@link module:data/repositories/room.getRoomById}
   * @see {@link module:util/errorUtils.format}
   */
  async createMessage({ roomId, authorId, text }, cb) {
    const socket = this;

    try {
      const createdMessage = await messageRepository.createMessage({ roomId, authorId, text });

      // Broadcast to all active Authors in the associated Room (Push Notification)
      const room = await roomRepository.getRoomById(createdMessage.roomId);
      const { authors: roomAuthors } = room;
      roomAuthors.forEach((author) => {
        if (author.isActive) {
          socket.to(author._id).emit(MESSAGE_CREATED, { message: createdMessage });
        }
      });

      // Send Message back to sender
      cb({ message: createdMessage });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Update a Message by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Message id
   * @param {Object} requestParams.updateValues - Update values
   * @param {string} requestParams.updateValues.text - Updated Message text
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/message.updateMessageById}
   * @see {@link module:util/errorUtils.format}
   */
  async updateMessageById({ id, updateValues: { text } }, cb) {
    const socket = this;

    try {
      const updatedMessage = await messageRepository.updateMessageById(id, { text });

      if (!updatedMessage) throw new ApplicationError({ message: 'Message not found.' });

      // Broadcast to Authors currently listening to the associated Room
      socket.to(updatedMessage.roomId).emit(MESSAGE_UPDATED, { message: updatedMessage });

      // Send Message back to sender
      cb({ message: updatedMessage });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Archive a Message by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Message id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/message.archiveMessageById}
   * @see {@link module:util/errorUtils.format}
   */
  async archiveMessageById({ id }, cb) {
    const socket = this;

    try {
      const archivedMessage = await messageRepository.archiveMessageById(id);

      if (!archivedMessage) throw new ApplicationError({ message: 'Message not found.' });

      // Broadcast to Authors currently listening to the associated Room
      socket.to(archivedMessage.roomId).emit(MESSAGE_ARCHIVED, { message: archivedMessage });

      // Send Message back to sender
      cb({ message: archivedMessage });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Delete a Message by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Message id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/message.deleteMessageById}
   * @see {@link module:util/errorUtils.format}
   */
  async deleteMessageById({ id }, cb) {
    const socket = this;

    try {
      const deletedMessage = await messageRepository.deleteMessageById(id);

      if (!deletedMessage) throw new ApplicationError({ message: 'Message not found.' });

      // Broadcast to Authors currently listening to the associated Room
      socket.to(deletedMessage.roomId).emit(MESSAGE_DELETED, { message: deletedMessage });

      // Send Message back to sender
      cb({ message: deletedMessage });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },
};
