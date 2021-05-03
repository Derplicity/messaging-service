// eslint-disable-next-line import/no-extraneous-dependencies
const sinon = require('sinon');

exports.mochaHooks = {
  afterEach() {
    sinon.restore();
  },
};
