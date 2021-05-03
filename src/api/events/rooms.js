const roomHandler = require('../handlers/rooms');
const {
  CREATE_ROOM,
  UPDATE_ROOM,
  ARCHIVE_ROOM,
  DELETE_ROOM,
  JOIN_ROOM,
  LEAVE_ROOM,
  JOIN_ROOMS,
  LEAVE_ROOMS,
} = require('../../config/eventTypes');

/**
 * Exposes Socket.io events for Rooms which map to handlers.
 * @module api/events/rooms
 * @see {@link module:api/handlers/rooms}
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = (socket) => {
  /**
   * Create new room
   * @see {@link module:api/handlers/rooms.createRoom}
   */
  socket.on(CREATE_ROOM, roomHandler.createRoom);

  /**
   * Join room
   * @see {@link module:api/handlers/rooms.joinRoom}
   */
  socket.on(JOIN_ROOM, roomHandler.joinRoom);

  /**
   * Join rooms
   * @see {@link module:api/handlers/rooms.joinRooms}
   */
  socket.on(JOIN_ROOMS, roomHandler.joinRooms);

  /**
   * Leave room
   * @see {@link module:api/handlers/rooms.leaveRoom}
   */
  socket.on(LEAVE_ROOM, roomHandler.leaveRoom);

  /**
   * Leave rooms
   * @see {@link module:api/handlers/rooms.leaveRooms}
   */
  socket.on(LEAVE_ROOMS, roomHandler.leaveRooms);

  /**
   * Update a room by id
   * @see {@link module:api/handlers/rooms.updateRoomById}
   */
  socket.on(UPDATE_ROOM, roomHandler.updateRoomById);

  /**
   * Archive a room by id
   * @see {@link module:api/handlers/rooms.archiveRoomById}
   */
  socket.on(ARCHIVE_ROOM, roomHandler.archiveRoomById);

  /**
   * Delete a room by id
   * @see {@link module:api/handlers/rooms.deleteRoomById}
   */
  socket.on(DELETE_ROOM, roomHandler.deleteRoomById);
};
