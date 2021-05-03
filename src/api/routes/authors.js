const { Router } = require('express');
const {
  createAuthor,
  getAllAuthors,
  getAuthorById,
  archiveAuthorById,
  updateAuthorById,
  deleteAuthorById,
} = require('../controllers/authors');

/**
 * Exposes Express endpoints for Authors which map to controller handlers.
 * @module api/routes/authors
 * @see {@link module:api/controllers/authors}
 * @see {@link https://github.com/expressjs/express}
 */
module.exports = Router()
  /**
   * Create new author
   * @see {@link module:api/controllers/authors.createAuthor}
   */
  .post('/', createAuthor)

  /**
   * Get all authors
   * @see {@link module:api/controllers/authors.getAllAuthors}
   */
  .get('/', getAllAuthors)

  /**
   * Get an author by id
   * @see {@link module:api/controllers/authors.getAuthorById}
   */
  .get('/:authorId', getAuthorById)

  /**
   * Update an author by id
   * @see {@link module:api/controllers/authors.updateAuthorById}
   */
  .put('/:authorId', updateAuthorById)

  /**
   * Archive an author by id
   * @see {@link module:api/controllers/authors.archiveAuthorById}
   */
  .put('/:authorId/archive', archiveAuthorById)

  /**
   * Delete an author by id
   * @see {@link module:api/controllers/authors.deleteAuthorById}
   */
  .delete('/:authorId', deleteAuthorById);
