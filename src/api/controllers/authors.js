const ApplicationError = require('../../util/ApplicationError');
const authorRepository = require('../../data/repositories/author');
const messageRepository = require('../../data/repositories/message');
const roomRepository = require('../../data/repositories/room');

/**
 * Exposes controller handlers for Author endpoints.
 * @module api/controllers/authors
 * @see {@link module:data/repositories/author}
 * @see {@link module:data/repositories/message}
 * @see {@link module:data/repositories/room}
 * @see {@link module:util/ApplicationError}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = {
  /**
   * Create and save a new Author.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.createAuthor}
   */
  async createAuthor(req, res, next) {
    let payload = {};

    try {
      const { _id, firstName, lastName } = req.body;
      const author = await authorRepository.createAuthor({ _id, firstName, lastName });

      res.status(201);
      res.location(`${req.baseUrl}/${author._id}`);

      payload = { author };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get all Authors with given options.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.getAllAuthors}
   */
  async getAllAuthors(req, res, next) {
    let payload = {};

    try {
      const { includeArchived, createdBefore, limit } = req.query;
      const allAuthors = await authorRepository.getAllAuthors({
        includeArchived,
        createdBefore,
        limit,
      });

      res.status(200);

      payload = { authors: allAuthors };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Get an Author by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.getAuthorById}
   */
  async getAuthorById(req, res, next) {
    let payload = {};

    try {
      const { authorId } = req.params;
      const author = await authorRepository.getAuthorById(authorId);

      res.status(200);

      if (!author) throw new ApplicationError({ message: 'Author not found.', statusCode: 404 });

      payload = { author };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Update an Author by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.updateAuthorById}
   */
  async updateAuthorById(req, res, next) {
    let payload = {};

    try {
      const { authorId } = req.params;
      const { firstName, lastName } = req.body;
      const updatedAuthor = await authorRepository.updateAuthorById(authorId, {
        firstName,
        lastName,
      });

      if (!updatedAuthor)
        throw new ApplicationError({ message: 'Author not found.', statusCode: 404 });

      res.status(200);

      payload = { author: updatedAuthor };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Archive an Author by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.archiveAuthorById}
   * @see {@link module:data/repositories/message.archiveAllMessages}
   * @see {@link module:data/repositories/room.archiveAllRooms}
   */
  async archiveAuthorById(req, res, next) {
    let payload = {};

    try {
      const { authorId } = req.params;
      const archivedAuthor = await authorRepository.archiveAuthorById(authorId);

      if (!archivedAuthor)
        throw new ApplicationError({ message: 'Author not found.', statusCode: 404 });

      // Archive Messages and Rooms associated with this Author
      await messageRepository.archiveAllMessages({ authorId });
      await roomRepository.archiveAllRooms({ authorId });

      res.status(200);

      payload = { author: archivedAuthor };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },

  /**
   * Delete an Author by id.
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @param {NextFunction} next - Function which invokes the next middleware
   * @throws {ApplicationError} Not found error
   * @returns {Response|NextFunction} Express response object or function which invokes the next
   *    middleware
   * @see {@link module:data/repositories/author.deleteAuthorById}
   * @see {@link module:data/repositories/message.deleteAllMessages}
   * @see {@link module:data/repositories/room.deleteAllRooms}
   */
  async deleteAuthorById(req, res, next) {
    let payload = {};

    try {
      const { authorId } = req.params;
      const deletedAuthor = await authorRepository.deleteAuthorById(authorId);

      if (!deletedAuthor)
        throw new ApplicationError({ message: 'Author not found.', statusCode: 404 });

      // Delete Messages and Rooms associated with this Author
      await messageRepository.deleteAllMessages({ authorId });
      await roomRepository.deleteAllRooms({ authorId });

      res.status(200);

      payload = {
        author: deletedAuthor,
      };
    } catch (err) {
      return next(err);
    }

    return res.json(payload);
  },
};
