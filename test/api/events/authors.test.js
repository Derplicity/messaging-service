const sinon = require('sinon');
const { expect } = require('chai');

const authorEvents = require('../../../src/api/events/authors');
const authorHandler = require('../../../src/api/handlers/authors');

describe('Author Events', () => {
  let socket;

  beforeEach(() => {
    socket = {
      on: sinon.stub(),
    };

    authorEvents(socket);
  });

  describe('UPDATE_AUTHOR', () => {
    it('should call updateAuthorById', () => {
      expect(socket.on.calledWithExactly('UPDATE_AUTHOR', authorHandler.updateAuthorById)).to.be
        .true;
    });
  });

  describe('ARCHIVE_AUTHOR', () => {
    it('should call archiveAuthorById', () => {
      expect(socket.on.calledWithExactly('ARCHIVE_AUTHOR', authorHandler.archiveAuthorById)).to.be
        .true;
    });
  });

  describe('DELETE_AUTHOR', () => {
    it('should call deleteAuthorById', () => {
      expect(socket.on.calledWithExactly('DELETE_AUTHOR', authorHandler.deleteAuthorById)).to.be
        .true;
    });
  });
});
