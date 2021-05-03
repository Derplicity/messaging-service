const { expect } = require('chai');

const router = require('../../../src/api/routes');

describe('Routes', () => {
  let routes;

  before(() => {
    routes = router.stack.map((route) => ({ regexp: route.regexp }));
  });

  it('should include /authors', async () => {
    expect(routes.filter((route) => route.regexp.test('/authors')).length).to.equal(1);
  });

  it('should include /rooms', async () => {
    expect(routes.filter((route) => route.regexp.test('/rooms')).length).to.equal(1);
  });

  it('should include /messages', async () => {
    expect(routes.filter((route) => route.regexp.test('/messages')).length).to.equal(1);
  });
});
