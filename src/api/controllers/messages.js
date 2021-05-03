const ApplicationError = require('../../util/ApplicationError');
const messageRepository = require('../../data/repositories/message');

/**
 * Exposes controller handlers for Message endpoints.
 * @module api/controllers/messages
 * @see {@link module:data/repositories/message}
 * @see {@link module:util/ApplicationError}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = {
  /**
   * Create and save a new Message.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.createMessage}
   */
  async createMessage(req, res, next) {
    let payload = {};

    try {
      const { roomId, authorId, text } = req.body;
      const savedMessage = await messageRepository.createMessage({ roomId, authorId, text });

      res.status(201);
      res.location(`${req.baseUrl}/${savedMessage._id}`);

      payload = { message: savedMessage };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get all Messages with given options.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.getAllMessages}
   */
  async getAllMessages(req, res, next) {
    let payload = {};

    try {
      const { roomId, authorId, includeArchived, createdBefore, limit } = req.query;
      const allMessages = await messageRepository.getAllMessages({
        roomId,
        authorId,
        includeArchived,
        createdBefore,
        limit,
      });

      res.status(200);

      payload = { messages: allMessages };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get an Message by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.getMessageById}
   */
  async getMessageById(req, res, next) {
    let payload = {};

    try {
      const { messageId } = req.params;
      const message = await messageRepository.getMessageById(messageId);

      res.status(200);

      if (!message) throw new ApplicationError({ message: 'Message not found.', statusCode: 404 });

      payload = { message };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Update an Message by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.updateMessageById}
   */
  async updateMessageById(req, res, next) {
    let payload = {};

    try {
      const { messageId } = req.params;
      const { text } = req.body;
      const updatedMessage = await messageRepository.updateMessageById(messageId, {
        text,
      });

      if (!updatedMessage)
        throw new ApplicationError({ message: 'Message not found.', statusCode: 404 });

      res.status(200);

      payload = { message: updatedMessage };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Archive an Message by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.archiveMessageById}
   */
  async archiveMessageById(req, res, next) {
    let payload = {};

    try {
      const { messageId } = req.params;
      const archivedMessage = await messageRepository.archiveMessageById(messageId);

      if (!archivedMessage)
        throw new ApplicationError({ message: 'Message not found.', statusCode: 404 });

      res.status(200);

      payload = { message: archivedMessage };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Delete an Message by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/message.deleteMessageById}
   */
  async deleteMessageById(req, res, next) {
    let payload = {};

    try {
      const { messageId } = req.params;
      const deletedMessage = await messageRepository.deleteMessageById(messageId);

      res.status(200);

      if (!deletedMessage)
        throw new ApplicationError({ message: 'Message not found.', statusCode: 404 });

      payload = {
        message: deletedMessage,
      };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },
};
