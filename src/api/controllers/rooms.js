const ApplicationError = require('../../util/ApplicationError');
const roomRepository = require('../../data/repositories/room');
const messageRepository = require('../../data/repositories/message');

/**
 * Exposes controller handlers for Room endpoints.
 * @module api/controllers/rooms
 * @see {@link module:data/repositories/room}
 * @see {@link module:data/repositories/message}
 * @see {@link module:util/ApplicationError}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = {
  /**
   * Create and save a new Room.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.createRoom}
   */
  async createRoom(req, res, next) {
    let payload = {};

    try {
      const { name, authors } = req.body;
      const room = await roomRepository.createRoom({ name, authors });

      res.status(201);
      res.location(`${req.baseUrl}/${room._id}`);

      payload = { room };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get all Rooms with given options.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.getAllRooms}
   */
  async getAllRooms(req, res, next) {
    let payload = {};

    try {
      const { authorId, onlyActive, includeArchived, updatedBefore, limit } = req.query;
      const allRooms = await roomRepository.getAllRooms({
        authorId,
        onlyActive,
        includeArchived,
        updatedBefore,
        limit,
      });

      res.status(200);

      payload = { rooms: allRooms };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get an Room by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.getRoomById}
   */
  async getRoomById(req, res, next) {
    let payload = {};

    try {
      const { roomId } = req.params;
      const room = await roomRepository.getRoomById(roomId);

      res.status(200);

      if (!room) throw new ApplicationError({ message: 'Room not found.', statusCode: 404 });

      payload = { room };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Update an Room by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.updateRoomById}
   */
  async updateRoomById(req, res, next) {
    let payload = {};

    try {
      const { roomId } = req.params;
      const { name, authors } = req.body;
      const updatedRoom = await roomRepository.updateRoomById(roomId, { name, authors });

      if (!updatedRoom) throw new ApplicationError({ message: 'Room not found.', statusCode: 404 });

      res.status(200);

      payload = { room: updatedRoom };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Archive an Room by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.archiveRoomById}
   * @see {@link module:data/repositories/message.archiveAllMessages}
   */
  async archiveRoomById(req, res, next) {
    let payload = {};

    try {
      const { roomId } = req.params;
      const archivedRoom = await roomRepository.archiveRoomById(roomId);

      if (!archivedRoom)
        throw new ApplicationError({ message: 'Room not found.', statusCode: 404 });

      // Archive Messages associated with this Room
      await messageRepository.archiveAllMessages({ roomId });

      res.status(200);

      payload = { room: archivedRoom };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Delete an Room by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/room.deleteRoomById}
   * @see {@link module:data/repositories/message.deleteAllMessages}
   */
  async deleteRoomById(req, res, next) {
    let payload = {};

    try {
      const { roomId } = req.params;
      const deletedRoom = await roomRepository.deleteRoomById(roomId);

      if (!deletedRoom) throw new ApplicationError({ message: 'Room not found.', statusCode: 404 });

      // Delete Messages associated with this Room
      await messageRepository.deleteAllMessages({ roomId });

      res.status(200);

      payload = {
        room: deletedRoom,
      };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },
};
