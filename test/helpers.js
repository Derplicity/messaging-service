const Author = require('../src/data/models/Author');
const Message = require('../src/data/models/Message');
const Room = require('../src/data/models/Room');

module.exports = {
  /**
   * Clear each collection of all data.
   */
  async clearDatabase() {
    await Author.deleteMany();
    await Message.deleteMany();
    await Room.deleteMany();
  },

  /**
   * Create initial parameters that mimic a route handler
   */
  initRouteParams() {
    return {
      req: {},
      res: {
        json(data) {
          return data;
        },
      },
      next() {},
    };
  },

  /**
   * Create initial mock socket object
   */
  initMockSocket() {
    return {
      emit() {},
      broadcast: { emit() {} },
    };
  },
};
