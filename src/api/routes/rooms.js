const { Router } = require('express');
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoomById,
  deleteRoomById,
  archiveRoomById,
} = require('../controllers/rooms');

/**
 * Exposes Express endpoints for Rooms which map to controller handlers.
 * @module api/routes/rooms
 * @see {@link module:api/controllers/rooms}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = Router()
  /**
   * Create new room
   * @see {@link module:api/controllers/rooms.createRoom}
   */
  .post('/', createRoom)

  /**
   * Get all rooms
   * @see {@link module:api/controllers/rooms.getAllRooms}
   */
  .get('/', getAllRooms)

  /**
   * Get a room by id
   * @see {@link module:api/controllers/rooms.getRoomById}
   */
  .get('/:roomId', getRoomById)

  /**
   * Update a room by id
   * @see {@link module:api/controllers/rooms.updateRoomById}
   */
  .put('/:roomId', updateRoomById)

  /**
   * Archive a room by id
   * @see {@link module:api/controllers/rooms.archiveRoomById}
   */
  .put('/:roomId/archive', archiveRoomById)

  /**
   * Delete a room by id
   * @see {@link module:api/controllers/rooms.deleteRoomById}
   */
  .delete('/:roomId', deleteRoomById);
