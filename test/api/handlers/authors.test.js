const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const errorUtils = require('../../../src/util/errorUtils');
const authorHandler = require('../../../src/api/handlers/authors');
const authorRepository = require('../../../src/data/repositories/author');
const messageRepository = require('../../../src/data/repositories/message');
const roomRepository = require('../../../src/data/repositories/room');

describe('Author Handler', () => {
  let socket;

  beforeEach(() => {
    socket = {
      to: sinon.stub().returnsThis(),
      emit: sinon.stub(),
    };
    sinon.stub(errorUtils, 'format');
  });

  afterEach(() => {
    errorUtils.format.restore();
  });

  describe('updateAuthorById', () => {
    let fakeUpdateAuthorById;

    beforeEach(() => {
      fakeUpdateAuthorById = authorHandler.updateAuthorById.bind(socket);
      sinon.stub(authorRepository, 'updateAuthorById');
      sinon.stub(roomRepository, 'getAllRooms');
    });

    afterEach(() => {
      authorRepository.updateAuthorById.restore();
      roomRepository.getAllRooms.restore();
    });

    it('should emit and return updated Author', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const reqArgs = [
        {
          id: authorId,
          updateValues: {
            firstName: updateArgs.firstName,
            lastName: updateArgs.lastName,
          },
        },
        cb,
      ];
      const updatedAuthor = {
        _id: authorId,
        firstName: updateArgs.firstName,
        lastName: updateArgs.lastName,
        isArchived: false,
      };
      const fetchedRooms = [
        { _id: '70f637d7-f2ec-4a6a-bc9a-317c6d9ed611' },
        { _id: 'a338ae39-ca8f-48bd-ae60-44ebfc2ccfa5' },
      ];

      const expectedRooms = [fetchedRooms[0]._id, fetchedRooms[1]._id];
      const expectedType = 'AUTHOR_UPDATED';
      const expectedRes = { author: updatedAuthor };

      authorRepository.updateAuthorById.returns(updatedAuthor);
      roomRepository.getAllRooms.returns(fetchedRooms);

      await fakeUpdateAuthorById(...reqArgs);

      expect(authorRepository.updateAuthorById.calledWithMatch(authorId, updateArgs)).to.be.true;
      expect(
        roomRepository.getAllRooms.calledWithMatch({
          authorId: updatedAuthor._id,
          onlyActive: 0,
          limit: 0,
        }),
      ).to.be.true;
      expect(socket.to.calledWithMatch(...expectedRooms)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Author not found', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const reqArgs = [
        {
          id: authorId,
          updateValues: {
            firstName: updateArgs.firstName,
            lastName: updateArgs.lastName,
          },
        },
        cb,
      ];

      const expectedError = { message: 'Author not found.' };

      authorRepository.updateAuthorById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeUpdateAuthorById(...reqArgs);

      expect(
        errorUtils.format.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', expectedError.message)),
        ),
      ).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });

    it('should return error if error thrown', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const reqArgs = [
        {
          id: authorId,
          updateValues: {
            firstName: updateArgs.firstName,
            lastName: updateArgs.lastName,
          },
        },
        cb,
      ];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.updateAuthorById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeUpdateAuthorById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('archiveAuthorById', () => {
    let fakeArchiveAuthorById;

    beforeEach(() => {
      fakeArchiveAuthorById = authorHandler.archiveAuthorById.bind(socket);
      sinon.stub(authorRepository, 'archiveAuthorById');
      sinon.stub(messageRepository, 'archiveAllMessages');
      sinon.stub(roomRepository, 'archiveAllRooms');
      sinon.stub(roomRepository, 'getAllRooms');
    });

    afterEach(() => {
      authorRepository.archiveAuthorById.restore();
      messageRepository.archiveAllMessages.restore();
      roomRepository.archiveAllRooms.restore();
      roomRepository.getAllRooms.restore();
    });

    it('should emit and return archived Author', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];
      const archivedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: true,
      };
      const fetchedRooms = [
        { _id: '70f637d7-f2ec-4a6a-bc9a-317c6d9ed611' },
        { _id: 'a338ae39-ca8f-48bd-ae60-44ebfc2ccfa5' },
      ];

      const expectedRooms = [fetchedRooms[0]._id, fetchedRooms[1]._id];
      const expectedType = 'AUTHOR_ARCHIVED';
      const expectedRes = { author: archivedAuthor };

      authorRepository.archiveAuthorById.returns(archivedAuthor);
      roomRepository.getAllRooms.returns(fetchedRooms);

      await fakeArchiveAuthorById(...reqArgs);

      expect(authorRepository.archiveAuthorById.calledWith(authorId)).to.be.true;
      expect(
        roomRepository.getAllRooms.calledWithMatch({
          authorId: archivedAuthor._id,
          onlyActive: 0,
          limit: 0,
        }),
      ).to.be.true;
      expect(messageRepository.archiveAllMessages.calledWithMatch({ authorId })).to.be.true;
      expect(roomRepository.archiveAllRooms.calledWithMatch({ authorId })).to.be.true;
      expect(socket.to.calledWithMatch(...expectedRooms)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Author not found', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];

      const expectedError = { message: 'Author not found.' };

      authorRepository.archiveAuthorById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeArchiveAuthorById(...reqArgs);

      expect(
        errorUtils.format.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', expectedError.message)),
        ),
      ).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });

    it('should return error if error thrown', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.archiveAuthorById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeArchiveAuthorById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('deleteAuthorById', () => {
    let fakeDeleteAuthorById;

    beforeEach(() => {
      fakeDeleteAuthorById = authorHandler.deleteAuthorById.bind(socket);
      sinon.stub(authorRepository, 'deleteAuthorById');
      sinon.stub(messageRepository, 'deleteAllMessages');
      sinon.stub(roomRepository, 'deleteAllRooms');
      sinon.stub(roomRepository, 'getAllRooms');
    });

    afterEach(() => {
      authorRepository.deleteAuthorById.restore();
      messageRepository.deleteAllMessages.restore();
      roomRepository.deleteAllRooms.restore();
      roomRepository.getAllRooms.restore();
    });

    it('should emit and return deleted Author', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];
      const deletedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: true,
      };
      const fetchedRooms = [
        { _id: '70f637d7-f2ec-4a6a-bc9a-317c6d9ed611' },
        { _id: 'a338ae39-ca8f-48bd-ae60-44ebfc2ccfa5' },
      ];

      const expectedRooms = [fetchedRooms[0]._id, fetchedRooms[1]._id];
      const expectedType = 'AUTHOR_DELETED';
      const expectedRes = { author: deletedAuthor };

      authorRepository.deleteAuthorById.returns(deletedAuthor);
      roomRepository.getAllRooms.returns(fetchedRooms);

      await fakeDeleteAuthorById(...reqArgs);

      expect(authorRepository.deleteAuthorById.calledWith(authorId)).to.be.true;
      expect(
        roomRepository.getAllRooms.calledWithMatch({
          authorId: deletedAuthor._id,
          onlyActive: 0,
          limit: 0,
        }),
      ).to.be.true;
      expect(messageRepository.deleteAllMessages.calledWithMatch({ authorId })).to.be.true;
      expect(roomRepository.deleteAllRooms.calledWithMatch({ authorId })).to.be.true;
      expect(socket.to.calledWithMatch(...expectedRooms)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Author not found', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];

      const expectedError = { message: 'Author not found.' };

      authorRepository.deleteAuthorById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeDeleteAuthorById(...reqArgs);

      expect(
        errorUtils.format.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', expectedError.message)),
        ),
      ).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });

    it('should return error if error thrown', async () => {
      const cb = sinon.stub();
      const authorId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: authorId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      authorRepository.deleteAuthorById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeDeleteAuthorById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });
});
