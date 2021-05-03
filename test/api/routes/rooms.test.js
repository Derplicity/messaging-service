const { expect } = require('chai');

const roomRouter = require('../../../src/api/routes/rooms');

describe('Room Routes', () => {
  let routes;

  before(() => {
    routes = roomRouter.stack.map(({ route }) => ({
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

    it('should call createRoom', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'post' && route.handler === 'createRoom',
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

    it('should call getAllRooms', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'get' && route.handler === 'getAllRooms',
        ).length,
      ).to.equal(1);
    });
  });

  describe('GET /:roomId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:roomId' && route.method === 'get').length,
      ).to.equal(1);
    });

    it('should call getRoomById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:roomId' && route.method === 'get' && route.handler === 'getRoomById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:roomId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:roomId' && route.method === 'put').length,
      ).to.equal(1);
    });

    it('should call updateRoomById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:roomId' &&
            route.method === 'put' &&
            route.handler === 'updateRoomById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:roomId/archive', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:roomId/archive' && route.method === 'put')
          .length,
      ).to.equal(1);
    });

    it('should call archiveRoomById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:roomId/archive' &&
            route.method === 'put' &&
            route.handler === 'archiveRoomById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('DELETE /:roomId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:roomId' && route.method === 'delete').length,
      ).to.equal(1);
    });

    it('should call deleteRoomById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:roomId' &&
            route.method === 'delete' &&
            route.handler === 'deleteRoomById',
        ).length,
      ).to.equal(1);
    });
  });
});
