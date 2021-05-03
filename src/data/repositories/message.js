const Message = require('../models/Message');
const { MAX_TIMESTAMP } = require('../../util/constants');

/**
 * Exposes functions which modify Message documents in a MongoDB database.
 * @module data/repositories/message
 * @see {@link module:data/models/Message}
 * @see {@link https://github.com/Automattic/mongoose}
 */
module.exports = {
  /**
   * Create and save a new Message.
   * @param {Object} message - The Message
   * @param {string} message.roomId - The Room id
   * @param {string} message.authorId - The Author id
   * @param {string} message.text - The text
   * @throws {MongooseError} Validation error
   * @returns {Object} The new Message
   */
  async createMessage({ roomId, authorId, text }) {
    const newMessage = new Message({ roomId, authorId, text });
    const savedMessage = await newMessage.save();
    const leanMessage = savedMessage.toObject();

    return leanMessage;
  },

  /**
   * Get all Messages with given options.
   * @param {Object} options - The options to use when querying Messages
   * @param {string} [options.roomId=''] - The Room id
   * @param {string} [options.authorId=''] - The Author id
   * @param {number} [options.includeArchived=0] - Whether or not to include archived Messages
   * @param {number} [options.createdBefore=8640000000000000] - Creation time of the newest Message
   *    in the list in milliseconds since January 1, 1970
   * @param {number} [options.limit=10] - Maximum number of Messages to return
   * @returns {Object[]} An array of Messages
   * @see {@link module:util/constants}
   */
  async getAllMessages({
    roomId = '',
    authorId = '',
    includeArchived = 0,
    createdBefore = MAX_TIMESTAMP,
    limit = 10,
  }) {
    const messageQuery = Message.find();

    if (roomId) messageQuery.where('roomId').equals(roomId);
    if (authorId) messageQuery.where('authorId').equals(authorId);
    if (!parseInt(includeArchived, 10)) messageQuery.where('isArchived').equals(false);

    const allMessages = await messageQuery
      .where('createdAt')
      .lt(new Date(parseInt(createdBefore, 10)))
      .sort('-createdAt')
      .limit(parseInt(limit, 10))
      .lean()
      .exec();

    return allMessages;
  },

  /**
   * Get a Message by id.
   * @param {string} id - The id
   * @returns {Object} The Message
   */
  async getMessageById(id) {
    const message = await Message.findById(id).lean().exec();

    return message;
  },

  /**
   * Update a Message by Id.
   * @param {string} id - The id
   * @param {Object} updates - The updates to the Message
   * @param {string} updates.text - The text
   * @throws {MongooseError} Validation error
   * @returns {Object} The updated Message
   */
  async updateMessageById(id, { text = '' }) {
    const updates = { text };
    const updatedMessage = await Message.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return updatedMessage;
  },

  /**
   * Archive a Message by id.
   * @param {string} id - The id
   * @returns {Object} The archived Message
   */
  async archiveMessageById(id) {
    const updates = { isArchived: true };
    const archivedMessage = await Message.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    return archivedMessage;
  },

  /**
   * Delete a Message by id.
   * @param {string} id - The id
   * @returns {Object} The deleted Message
   */
  async deleteMessageById(id) {
    const deletedMessage = await Message.findByIdAndDelete(id).lean().exec();

    if (!deletedMessage) return null;

    return deletedMessage;
  },

  /**
   * Archive all Messages with the given attributes.
   * @param {Object} attributes - The attributes to match against when querying Messages
   * @param {string} [roomId=''] - The Room id
   * @param {string} [authorId=''] - The Author id
   * @returns {boolean} If the operation was sucessful.
   */
  async archiveAllMessages({ roomId = '', authorId = '' }) {
    const updates = { isArchived: true };
    const messageQuery = Message.updateMany({}, updates);

    if (roomId) messageQuery.where('roomId').equals(roomId);
    if (authorId) messageQuery.where('authorId').equals(authorId);

    const archiveRes = await messageQuery.lean().exec();

    return archiveRes.ok;
  },

  /**
   * Delete all Messages with the given attributes.
   * @param {Object} attributes - The attributes to match against when querying Messages
   * @param {string} [roomId=''] - The Room id
   * @param {string} [authorId=''] - The Author id
   * @returns {boolean} If the operation was sucessful.
   */
  async deleteAllMessages({ roomId = '', authorId = '' }) {
    const messageQuery = Message.deleteMany({});

    if (roomId) messageQuery.where('roomId').equals(roomId);
    if (authorId) messageQuery.where('authorId').equals(authorId);

    const deleteRes = await messageQuery.lean().exec();

    return deleteRes.ok;
  },
};
