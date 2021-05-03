const { expect } = require('chai');

const messageRouter = require('../../../src/api/routes/messages');

describe('Message Routes', () => {
  let routes;

  before(() => {
    routes = messageRouter.stack.map(({ route }) => ({
      path: route.path,
      method: Object.keys(route.methods)[0],
      handler: route.stack[0].name,
    }));
  });

  describe('POST /', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/' && route.method === 'post').length,
      ).to.equal(1);
    });

    it('should call createMessage', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'post' && route.handler === 'createMessage',
        ).length,
      ).to.equal(1);
    });
  });

  describe('GET /', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/' && route.method === 'get').length,
      ).to.equal(1);
    });

    it('should call getAllMessages', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'get' && route.handler === 'getAllMessages',
        ).length,
      ).to.equal(1);
    });
  });

  describe('GET /:messageId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:messageId' && route.method === 'get').length,
      ).to.equal(1);
    });

    it('should call getMessageById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:messageId' &&
            route.method === 'get' &&
            route.handler === 'getMessageById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:messageId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:messageId' && route.method === 'put').length,
      ).to.equal(1);
    });

    it('should call updateMessageById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:messageId' &&
            route.method === 'put' &&
            route.handler === 'updateMessageById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:messageId/archive', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:messageId/archive' && route.method === 'put')
          .length,
      ).to.equal(1);
    });

    it('should call archiveMessageById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:messageId/archive' &&
            route.method === 'put' &&
            route.handler === 'archiveMessageById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('DELETE /:messageId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:messageId' && route.method === 'delete').length,
      ).to.equal(1);
    });

    it('should call deleteMessageById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:messageId' &&
            route.method === 'delete' &&
            route.handler === 'deleteMessageById',
        ).length,
      ).to.equal(1);
    });
  });
});
