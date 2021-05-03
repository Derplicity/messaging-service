const ApplicationError = require('../../util/ApplicationError');
const authorRepository = require('../../data/repositories/author');
const messageRepository = require('../../data/repositories/message');
const roomRepository = require('../../data/repositories/room');
const errorUtils = require('../../util/errorUtils');

const { AUTHOR_ARCHIVED, AUTHOR_DELETED, AUTHOR_UPDATED } = require('../../config/eventTypes');

/**
 * Exposes handlers for Author events.
 * @module api/handlers/authors
 * @see {@link module:data/repositories/author}
 * @see {@link module:data/repositories/message}
 * @see {@link module:data/repositories/room}
 * @see {@link module:util/ApplicationError}
 * @see {@link module:util/errorUtils}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = {
  /**
   * Update an Author by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Author id
   * @param {Object} requestParams.updateValues - Update values
   * @param {string} requestParams.updateValues.firstName - Updated first name
   * @param {string} requestParams.updateValues.lastName - Updated last name
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/author.updateAuthorById}
   * @see {@link module:data/repositories/room.getAllRooms}
   * @see {@link module:util/errorUtils.format}
   */
  async updateAuthorById({ id, updateValues: { firstName, lastName } }, cb) {
    const socket = this;

    try {
      const updatedAuthor = await authorRepository.updateAuthorById(id, { firstName, lastName });

      if (!updatedAuthor) throw new ApplicationError({ message: 'Author not found.' });

      const rooms = await roomRepository.getAllRooms({
        authorId: updatedAuthor._id,
        onlyActive: 0,
        limit: 0,
      });

      // Broadcast to Authors currently listening to the associated rooms
      socket.to(...rooms.map((room) => room._id)).emit(AUTHOR_UPDATED, { author: updatedAuthor });

      // Send Author back to sender
      cb({ author: updatedAuthor });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Archive a Author by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Author id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/author.archiveAuthorById}
   * @see {@link module:data/repositories/message.archiveAllMessages}
   * @see {@link module:data/repositories/room.archiveAllRooms}
   * @see {@link module:data/repositories/room.getAllRooms}
   * @see {@link module:util/errorUtils.format}
   */
  async archiveAuthorById({ id }, cb) {
    const socket = this;

    try {
      const archivedAuthor = await authorRepository.archiveAuthorById(id);

      if (!archivedAuthor) throw new ApplicationError({ message: 'Author not found.' });

      const rooms = await roomRepository.getAllRooms({
        authorId: archivedAuthor._id,
        onlyActive: 0,
        limit: 0,
      });

      await messageRepository.archiveAllMessages({ authorId: id });
      await roomRepository.archiveAllRooms({ authorId: id });

      // Broadcast to Authors currently listening to the associated rooms; client will manage
      // archive Messages/Rooms
      socket.to(...rooms.map((room) => room._id)).emit(AUTHOR_ARCHIVED, { author: archivedAuthor });
      // Send Author back to sender
      cb({ author: archivedAuthor });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Delete a author by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Author id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/author.deleteAuthorById}
   * @see {@link module:data/repositories/message.deleteAllMessages}
   * @see {@link module:data/repositories/room.deleteAllRooms}
   * @see {@link module:data/repositories/room.getAllRooms}
   * @see {@link module:util/errorUtils.format}
   */
  async deleteAuthorById({ id }, cb) {
    const socket = this;

    try {
      const deletedAuthor = await authorRepository.deleteAuthorById(id);

      if (!deletedAuthor) throw new ApplicationError({ message: 'Author not found.' });

      const rooms = await roomRepository.getAllRooms({
        authorId: deletedAuthor._id,
        onlyActive: 0,
        limit: 0,
      });

      await messageRepository.deleteAllMessages({ authorId: id });
      await roomRepository.deleteAllRooms({ authorId: id });

      // Broadcast to Authors currently listening to the associated rooms; client will manage
      // delete Messages/Rooms
      socket.to(...rooms.map((room) => room._id)).emit(AUTHOR_DELETED, { author: deletedAuthor });

      // Send Author back to sender
      cb({ author: deletedAuthor });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },
};
