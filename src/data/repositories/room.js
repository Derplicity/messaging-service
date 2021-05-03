const Message = require('../models/Message');
const Room = require('../models/Room');
const { MAX_TIMESTAMP } = require('../../util/constants');

/**
 * Flatten Author objects for more intuitive organization.
 * @param {Object[]} authors - List of Authors
 * @returns {Object[]} List of flattened Authors
 */
const flattenAuthors = (authors) => authors.map(({ author, ...rest }) => ({ ...author, ...rest }));

/**
 * Exposes functions which modify Room documents in a MongoDB database.
 * @module data/repositories/room
 * @see {@link module:data/models/Room}
 * @see {@link module:data/models/Message}
 * @see {@link https://github.com/Automattic/mongoose}
 */
module.exports = {
  /**
   * Create and save a new Room.
   * @param {Object} room - The Room
   * @param {string} room.name - The name of the Room
   * @param {Object[]} room.authors - The Authors
   * @throws {MongooseError} Validation error
   * @returns {Object} The new Room
   */
  async createRoom({ name, authors = [] }) {
    const newRoom = new Room({ name, authors: authors.map(({ _id }) => ({ author: _id })) });
    const savedRoom = await newRoom.save();
    const populatedRoom = await Room.populate(savedRoom, { path: 'authors.author' });
    const leanRoom = populatedRoom.toObject();
    const { authors: roomAuthors } = leanRoom;

    leanRoom.authors = flattenAuthors(roomAuthors);

    return leanRoom;
  },

  /**
   * Get all Rooms with given options.
   * @param {Object} options - The options to use when querying Rooms
   * @param {string} [options.authorId=''] - The Author id
   * @param {number} [options.onlyActive=1] - Whether or not to only include Rooms the given Author
   *    is active in
   * @param {number} [options.includeArchived=0] - Whether or not to include archived Rooms
   * @param {number} [options.updatedBefore=8640000000000000] - Update time of the newest Room in
   *    the list in milliseconds since January 1, 1970
   * @param {number} [options.limit=10] - Maximum number of Rooms to return
   * @returns {Object[]} An array of Rooms
   * @see {@link module:util/constants}
   */
  async getAllRooms({
    authorId = '',
    onlyActive = 1,
    includeArchived = 0,
    updatedBefore = MAX_TIMESTAMP,
    limit = 10,
  }) {
    const roomQuery = Room.find();

    if (authorId) {
      if (parseInt(onlyActive, 10)) {
        roomQuery.where('authors').elemMatch({ author: authorId, isActive: true });
      } else {
        roomQuery.where('authors').elemMatch({ author: authorId });
      }
    }

    if (!parseInt(includeArchived, 10)) roomQuery.where('isArchived').equals(false);

    const allRooms = await roomQuery
      .where('updatedAt')
      .lt(new Date(parseInt(updatedBefore, 10)))
      .sort('-updatedAt')
      .limit(parseInt(limit, 10))
      .populate('authors.author')
      .lean()
      .exec();

    const allReformatedRooms = await Promise.all(
      allRooms.map(async (room) => {
        // Get most recent Message for this Room
        const mostRecentMessage =
          (await Message.findOne()
            .where('roomId')
            .equals(room._id)
            .where('isArchived')
            .equals(false)
            .sort('-createdAt')
            .lean()
            .exec()) || {};

        return { ...room, authors: flattenAuthors(room.authors), mostRecentMessage };
      }),
    );

    return allReformatedRooms;
  },

  /**
   * Get a Room by id.
   * @param {string} id - The id
   * @returns {Object} The Room
   */
  async getRoomById(id) {
    const room = await Room.findById(id).populate('authors.author').lean().exec();

    if (!room) return null;

    const { authors } = room;

    room.authors = flattenAuthors(authors);

    return room;
  },

  /**
   * Update a Room by Id.
   * @param {string} id - The id
   * @param {Object} updates - The updates to the Room
   * @param {string} updates.name - The name
   * @param {Object[]} updates.authors - The Authors
   * @throws {MongooseError} Validation error
   * @returns {Object} The updated Room
   */
  async updateRoomById(id, { name = '', authors = [] }) {
    const updates = {
      name,
      authors: authors.map(({ _id, isActive }) => ({ author: _id, isActive })),
    };
    const updatedRoom = await Room.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('authors.author')
      .lean()
      .exec();

    if (!updatedRoom) return null;

    const { authors: roomAuthors } = updatedRoom;

    updatedRoom.authors = flattenAuthors(roomAuthors);

    return updatedRoom;
  },

  /**
   * Archive a Room by id.
   * @param {string} id - The id
   * @returns {Object} The archived Room
   */
  async archiveRoomById(id) {
    const updates = { isArchived: true };
    const archivedRoom = await Room.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('authors.author')
      .lean()
      .exec();

    if (!archivedRoom) return null;

    const { authors: roomAuthors } = archivedRoom;

    archivedRoom.authors = flattenAuthors(roomAuthors);

    return archivedRoom;
  },

  /**
   * Delete a Room by id.
   * @param {string} id - The id
   * @returns {Object} The deleted Room
   */
  async deleteRoomById(id) {
    const deletedRoom = await Room.findByIdAndDelete(id).lean().exec();

    if (!deletedRoom) return null;

    return deletedRoom;
  },

  /**
   * Archive all Rooms with the given attributes.
   * @param {Object} attributes - The attributes to match against when querying Rooms
   * @param {string} [authorId=''] - The Author id
   * @returns {boolean} If the operation was sucessful.
   */
  async archiveAllRooms({ authorId = '' }) {
    const roomQuery = Room.find({});

    if (authorId) roomQuery.where('authors').elemMatch({ author: authorId, isActive: true });

    const rooms = await roomQuery.exec();

    await Promise.all(
      rooms.map(async (room) => {
        const { authors } = room;

        let numActiveAuthors = 0;

        // Count active Authors and set given Author as inactive
        const updatedAuthors = authors.map((author) => {
          const updatedAuthor = author;

          if (author.isActive) numActiveAuthors += 1;

          if (author.author === authorId) {
            updatedAuthor.isActive = false;
            numActiveAuthors -= 1;
          }

          return updatedAuthor;
        });

        await room.updateOne({ authors: updatedAuthors, isArchived: numActiveAuthors <= 0 });
      }),
    );

    return true;
  },

  /**
   * Delete all Rooms with the given attributes.
   * @param {Object} attributes - The attributes to match against when querying Rooms
   * @param {string} [authorId=''] - The Author id
   * @returns {boolean} If the operation was sucessful.
   */
  async deleteAllRooms({ authorId = '' }) {
    const roomQuery = Room.find({});

    if (authorId) roomQuery.where('authors').elemMatch({ author: authorId });

    const rooms = await roomQuery.exec();

    await Promise.all(
      rooms.map(async (room) => {
        const { authors } = room;

        let numActiveAuthors = 0;

        // Count active Authors and remove given Author from Room
        const updatedAuthors = authors.reduce((acc, author) => {
          if (author.isActive) numActiveAuthors += 1;

          if (author.author === authorId) numActiveAuthors -= 1;

          if (author.author !== authorId) acc.push(author);

          return acc;
        }, []);

        // Delete Room if no active Authors, otherwise just remove Author from Room
        if (numActiveAuthors <= 0) {
          await room.deleteOne();
        } else {
          await room.updateOne({ authors: updatedAuthors });
        }
      }),
    );

    return true;
  },
};
