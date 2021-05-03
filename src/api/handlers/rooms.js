const ApplicationError = require('../../util/ApplicationError');
const roomRepository = require('../../data/repositories/room');
const messageRepository = require('../../data/repositories/message');
const errorUtils = require('../../util/errorUtils');

const {
  ROOM_ARCHIVED,
  ROOM_CREATED,
  ROOM_DELETED,
  ROOM_UPDATED,
  ROOM_JOINED,
  ROOMS_JOINED,
  ROOM_LEFT,
  ROOMS_LEFT,
} = require('../../config/eventTypes');

/**
 * Exposes handlers for Room events.
 * @module api/handlers/rooms
 * @see {@link module:data/repositories/message}
 * @see {@link module:data/repositories/room}
 * @see {@link module:util/ApplicationError}
 * @see {@link module:util/errorUtils}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = {
  /**
   * Create a new Room.
   * @param {Object} requestParams - Request Parameters
   * @param {Object} requestParams.creationValues - Creation values
   * @param {string} requestParams.creationValues.name - Room name
   * @param {Object[]} requestParams.creationValues.authors - Room Authors
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/room.createRoom}
   * @see {@link module:util/errorUtils.format}
   */
  async createRoom({ name, authors }, cb) {
    const socket = this;

    try {
      const createdRoom = await roomRepository.createRoom({ name, authors });

      // Broadcast to all Authors in this Room (Push Notification)
      const { authors: roomAuthors } = createdRoom;
      roomAuthors.forEach((author) => {
        socket.to(author._id).emit(ROOM_CREATED, { room: createdRoom });
      });

      // Send Room back to sender
      cb({ room: createdRoom });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Join a Room.
   * @param {string} room - Room to join
   */
  joinRoom(room) {
    const socket = this;

    socket.join(room);

    socket.emit(ROOM_JOINED, room);
  },

  /**
   * Join multiple Rooms.
   * @param {string[]} rooms - Rooms to join
   */
  joinRooms(rooms) {
    const socket = this;

    rooms.forEach((room) => {
      socket.join(room);
    });

    socket.emit(ROOMS_JOINED, rooms);
  },

  /**
   * Leave a Room.
   * @param {string} room - Room to leave
   */
  leaveRoom(room) {
    const socket = this;

    socket.leave(room);

    socket.emit(ROOM_LEFT, room);
  },

  /**
   * Leave multiple Rooms.
   * @param {string[]} rooms - Rooms to leave
   */
  leaveRooms(rooms) {
    const socket = this;

    rooms.forEach((room) => {
      socket.leave(room);
    });

    socket.emit(ROOMS_LEFT, rooms);
  },

  /**
   * Update a Room by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Room id
   * @param {Object} requestParams.updateValues - Update values
   * @param {string} requestParams.updateValues.name - Updated name
   * @param {Object[]} requestParams.updateValues.authors - Updated Authors
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/room.updateRoomById}
   * @see {@link module:util/errorUtils.format}
   */
  async updateRoomById({ id, updateValues: { name, authors } }, cb) {
    const socket = this;

    try {
      const updatedRoom = await roomRepository.updateRoomById(id, { name, authors });

      if (!updatedRoom) throw new ApplicationError({ message: 'Room not found.' });

      // Broadcast to Authors currently listening to this Room
      socket.to(updatedRoom._id).emit(ROOM_UPDATED, { room: updatedRoom });

      // Send Room back to sender
      cb({ room: updatedRoom });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Archive a Room by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Room id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/room.archiveRoomById}
   * @see {@link module:data/repositories/message.archiveAllMessages}
   * @see {@link module:util/errorUtils.format}
   */
  async archiveRoomById({ id }, cb) {
    const socket = this;

    try {
      const archivedRoom = await roomRepository.archiveRoomById(id);

      if (!archivedRoom) throw new ApplicationError({ message: 'Room not found.' });

      await messageRepository.archiveAllMessages({ roomId: id });

      // Broadcast to Authors currently listening to this Room
      socket.to(archivedRoom._id).emit(ROOM_ARCHIVED, { room: archivedRoom });

      // Send Room back to sender
      cb({ room: archivedRoom });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },

  /**
   * Delete a Room by id.
   * @param {Object} requestParams - Request Parameters
   * @param {uuid} requestParams.id - Room id
   * @param {function} cb - Callback Function
   * @throws {ApplicationError} Not found error
   * @see {@link module:data/repositories/room.deleteRoomById}
   * @see {@link module:data/repositories/message.deleteAllMessages}
   * @see {@link module:util/errorUtils.format}
   */
  async deleteRoomById({ id }, cb) {
    const socket = this;

    try {
      const deletedRoom = await roomRepository.deleteRoomById(id);

      if (!deletedRoom) throw new ApplicationError({ message: 'Room not found.' });

      await messageRepository.deleteAllMessages({ roomId: id });

      // Broadcast to Authors currently listening to this Room
      socket.to(deletedRoom._id).emit(ROOM_DELETED, { room: deletedRoom });

      // Send Room back to sender
      cb({ room: deletedRoom });
    } catch (err) {
      cb({ error: errorUtils.format(err) });
    }
  },
};
