const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const authorController = require('../../../src/api/controllers/authors');
const authorRepository = require('../../../src/data/repositories/author');
const messageRepository = require('../../../src/data/repositories/message');
const roomRepository = require('../../../src/data/repositories/room');

describe('Author Controller', () => {
  let routeParams;

  beforeEach(() => {
    routeParams = {
      req: {},
      res: {
        json: sinon.stub(),
        status: sinon.stub(),
      },
      next: sinon.stub(),
    };
  });

  describe('createAuthor', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'createAuthor');
    });

    afterEach(() => {
      authorRepository.createAuthor.restore();
    });

    it('should return created Author', async () => {
      const baseUrl = '/test/url';
      const body = {
        _id: '86096581-8169-4c0c-8470-2a334e541d13',
        firstName: 'John',
        lastName: 'Doe',
      };
      const creationArgs = {
        _id: body._id,
        firstName: body.firstName,
        lastName: body.lastName,
      };
      const createdAuthor = {
        _id: creationArgs._id,
        firstName: creationArgs.firstName,
        lastName: creationArgs.lastName,
        isArchived: false,
      };

      const expectedStatus = 201;
      const expectedLocation = `${baseUrl}/${createdAuthor._id}`;
      const expectedJson = { author: createdAuthor };

      authorRepository.createAuthor.returns(createdAuthor);

      routeParams.req = { ...routeParams.req, body, baseUrl };
      routeParams.res = { ...routeParams.res, location: sinon.stub() };

      await authorController.createAuthor(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.createAuthor.calledWithMatch(creationArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(res.location.calledWith(expectedLocation)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const body = {
        _id: '86096581-8169-4c0c-8470-2a334e541d13',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.createAuthor.throws(expectedError);

      routeParams.req = { ...routeParams.req, body };

      await authorController.createAuthor(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getAllAuthors', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'getAllAuthors');
    });

    afterEach(() => {
      authorRepository.getAllAuthors.restore();
    });

    it('should return list of Authors', async () => {
      const query = {
        includeArchived: true,
        createdBefore: Date.UTC(2021),
        limit: 10,
      };
      const fetchArgs = {
        includeArchived: query.includeArchived,
        createdBefore: query.createdBefore,
        limit: query.limit,
      };
      const fetchedAuthors = [
        {
          _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
          firstName: 'John',
          lastName: 'Doe',
          isArchived: false,
        },
        {
          id: '54350cdd-ea19-458d-9d7c-8f10b701cfda',
          firstName: 'Sam',
          lastName: 'Smith',
          isArchived: true,
        },
      ];

      const expectedStatus = 200;
      const expectedJson = { authors: fetchedAuthors };

      authorRepository.getAllAuthors.returns(fetchedAuthors);

      routeParams.req = { ...routeParams.req, query };

      await authorController.getAllAuthors(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.getAllAuthors.calledWithMatch(fetchArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const query = {
        includeArchived: true,
        createdBefore: Date.UTC(2021),
        limit: 10,
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.getAllAuthors.throws(expectedError);

      routeParams.req = { ...routeParams.req, query };

      await authorController.getAllAuthors(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getAuthorById', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'getAuthorById');
    });

    afterEach(() => {
      authorRepository.getAuthorById.restore();
    });

    it('should return requested Author', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { authorId } = params;
      const fetchedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { author: fetchedAuthor };

      authorRepository.getAuthorById.returns(fetchedAuthor);

      routeParams.req = { ...routeParams.req, params };

      await authorController.getAuthorById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.getAuthorById.calledWith(authorId)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Author not found', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      authorRepository.getAuthorById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await authorController.getAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Author not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.getAuthorById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await authorController.getAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('updateAuthorById', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'updateAuthorById');
    });

    afterEach(() => {
      authorRepository.updateAuthorById.restore();
    });

    it('should return updated Author', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const { authorId } = params;
      const updateArgs = {
        firstName: body.firstName,
        lastName: body.lastName,
      };
      const updatedAuthor = {
        _id: authorId,
        firstName: updateArgs.firstName,
        lastName: updateArgs.lastName,
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { author: updatedAuthor };

      authorRepository.updateAuthorById.returns(updatedAuthor);

      routeParams.req = { ...routeParams.req, body, params };

      await authorController.updateAuthorById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.updateAuthorById.calledWithMatch(authorId, updateArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Author not found', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        firstName: 'John',
        lastName: 'Doe',
      };

      authorRepository.updateAuthorById.returns(null);

      routeParams.req = { ...routeParams.req, body, params };

      await authorController.updateAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Author not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.updateAuthorById.throws(expectedError);

      routeParams.req = { ...routeParams.req, body, params };

      await authorController.updateAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('archiveAuthorById', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'archiveAuthorById');
      sinon.stub(messageRepository, 'archiveAllMessages');
      sinon.stub(roomRepository, 'archiveAllRooms');
    });

    afterEach(() => {
      authorRepository.archiveAuthorById.restore();
      messageRepository.archiveAllMessages.restore();
      roomRepository.archiveAllRooms.restore();
    });

    it('should return archived Author', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { authorId } = params;
      const archivedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { author: archivedAuthor };

      authorRepository.archiveAuthorById.returns(archivedAuthor);

      routeParams.req = { ...routeParams.req, params };

      await authorController.archiveAuthorById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.archiveAuthorById.calledWith(authorId)).to.be.true;
      expect(messageRepository.archiveAllMessages.calledWithMatch({ authorId })).to.be.true;
      expect(roomRepository.archiveAllRooms.calledWithMatch({ authorId })).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Author not found', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      authorRepository.archiveAuthorById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await authorController.archiveAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Author not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.archiveAuthorById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await authorController.archiveAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('deleteAuthorById', () => {
    beforeEach(() => {
      sinon.stub(authorRepository, 'deleteAuthorById');
      sinon.stub(messageRepository, 'deleteAllMessages');
      sinon.stub(roomRepository, 'deleteAllRooms');
    });

    afterEach(() => {
      authorRepository.deleteAuthorById.restore();
      messageRepository.deleteAllMessages.restore();
      roomRepository.deleteAllRooms.restore();
    });

    it('should return deleted Author', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { authorId } = params;
      const deletedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { author: deletedAuthor };

      authorRepository.deleteAuthorById.returns(deletedAuthor);

      routeParams.req = { ...routeParams.req, params };

      await authorController.deleteAuthorById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(authorRepository.deleteAuthorById.calledWith(authorId)).to.be.true;
      expect(messageRepository.deleteAllMessages.calledWithMatch({ authorId })).to.be.true;
      expect(roomRepository.deleteAllRooms.calledWithMatch({ authorId })).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Author not found', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      authorRepository.deleteAuthorById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await authorController.deleteAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Author not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { authorId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.deleteAuthorById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await authorController.deleteAuthorById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });
});
