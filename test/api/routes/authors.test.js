const { expect } = require('chai');

const authorRouter = require('../../../src/api/routes/authors');

describe('Author Routes', () => {
  let routes;

  before(() => {
    routes = authorRouter.stack.map(({ route }) => ({
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

    it('should call createAuthor', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'post' && route.handler === 'createAuthor',
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

    it('should call getAllAuthors', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/' && route.method === 'get' && route.handler === 'getAllAuthors',
        ).length,
      ).to.equal(1);
    });
  });

  describe('GET /:authorId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:authorId' && route.method === 'get').length,
      ).to.equal(1);
    });

    it('should call getAuthorById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:authorId' &&
            route.method === 'get' &&
            route.handler === 'getAuthorById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:authorId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:authorId' && route.method === 'put').length,
      ).to.equal(1);
    });

    it('should call updateAuthorById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:authorId' &&
            route.method === 'put' &&
            route.handler === 'updateAuthorById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('PUT /:authorId/archive', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:authorId/archive' && route.method === 'put')
          .length,
      ).to.equal(1);
    });

    it('should call archiveAuthorById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:authorId/archive' &&
            route.method === 'put' &&
            route.handler === 'archiveAuthorById',
        ).length,
      ).to.equal(1);
    });
  });

  describe('DELETE /:authorId', () => {
    it('should exist', async () => {
      expect(
        routes.filter((route) => route.path === '/:authorId' && route.method === 'delete').length,
      ).to.equal(1);
    });

    it('should call deleteAuthorById', () => {
      expect(
        routes.filter(
          (route) =>
            route.path === '/:authorId' &&
            route.method === 'delete' &&
            route.handler === 'deleteAuthorById',
        ).length,
      ).to.equal(1);
    });
  });
});
