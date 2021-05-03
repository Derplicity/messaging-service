const Author = require('../models/Author');
const { MAX_TIMESTAMP } = require('../../util/constants');

/**
 * Exposes functions which modify Author documents in a MongoDB database.
 * @module data/repositories/author
 * @see {@link module:data/models/Author}
 * @see {@link https://github.com/Automattic/mongoose}
 */
module.exports = {
  /**
   * Create and save a new Author.
   * @param {Object} author - The Author
   * @param {string} author._id - The id
   * @param {string} author.firstName - The first name
   * @param {string} author.lastName - The last name
   * @throws {MongooseError} Validation error
   * @returns {Object} The new Author
   */
  async createAuthor({ _id, firstName, lastName }) {
    const newAuthor = new Author({ _id, firstName, lastName });
    const savedAuthor = await newAuthor.save();
    const leanAuthor = savedAuthor.toObject();

    return leanAuthor;
  },

  /**
   * Get all Authors with given options.
   * @param {Object} options - The options to use when querying Authors
   * @param {number} [options.includeArchived=0] - Whether or not to include archived Authors
   * @param {number} [options.createdBefore=8640000000000000] - Creation time of the newest author
   *    in the list in milliseconds since January 1, 1970
   * @param {number} [options.limit=10] - Maximum number of Authors to return
   * @returns {Object[]} An array of Authors
   * @see {@link module:util/constants}
   */
  async getAllAuthors({ includeArchived = 0, createdBefore = MAX_TIMESTAMP, limit = 10 }) {
    const authorQuery = Author.find();

    if (!parseInt(includeArchived, 10)) authorQuery.where('isArchived').equals(false);

    const allAuthors = await authorQuery
      .where('createdAt')
      .lt(new Date(parseInt(createdBefore, 10)))
      .sort('-createdAt')
      .limit(parseInt(limit, 10))
      .lean()
      .exec();

    return allAuthors;
  },

  /**
   * Get an Author by id.
   * @param {string} id - The id
   * @returns {Object} The Author
   */
  async getAuthorById(id) {
    const author = await Author.findById(id).lean().exec();

    return author;
  },

  /**
   * Update an Author by id.
   * @param {string} id - The id
   * @param {Object} updates - The updates to the Author
   * @param {string} updates.firstName - The first name
   * @param {string} updates.lastName - The last name
   * @throws {MongooseError} Validation error
   * @returns {Object} The updated Author
   */
  async updateAuthorById(id, { firstName = '', lastName = '' }) {
    const updates = { firstName, lastName };
    const updatedAuthor = await Author.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return updatedAuthor;
  },

  /**
   * Archive an Author by id.
   * @param {string} id - The id
   * @returns {Object} The archived Author
   */
  async archiveAuthorById(id) {
    const updates = { isArchived: true };
    const archivedAuthor = await Author.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return archivedAuthor;
  },

  /**
   * Delete an Author by id.
   * @param {string} id - The id
   * @returns {Object} The deleted Author
   */
  async deleteAuthorById(id) {
    const deletedAuthor = await Author.findByIdAndDelete(id).lean().exec();

    if (!deletedAuthor) return null;

    return deletedAuthor;
  },
};
