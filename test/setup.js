// eslint-disable-next-line import/no-extraneous-dependencies
const { MongoMemoryServer } = require('mongodb-memory-server');

const db = require('../src/data/db');

module.exports = {
  /**
   * Global setup for mocha tests.
   */
  async mochaGlobalSetup() {
    this.mongoServer = new MongoMemoryServer();
    const mongoUri = await this.mongoServer.getUri();
    await db.connect(mongoUri);
  },
};
