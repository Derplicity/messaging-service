const sinon = require('sinon');
const { expect } = require('chai');

const messageEvents = require('../../../src/api/events/messages');
const messageHandler = require('../../../src/api/handlers/messages');

describe('Message Events', () => {
  let socket;

  beforeEach(() => {
    socket = {
      on: sinon.stub(),
    };

    messageEvents(socket);
  });

  describe('CREATE_MESSAGE', () => {
    it('should call createMessage', () => {
      expect(socket.on.calledWithExactly('CREATE_MESSAGE', messageHandler.createMessage)).to.be
        .true;
    });
  });

  describe('UPDATE_MESSAGE', () => {
    it('should call updateMessageById', () => {
      expect(socket.on.calledWithExactly('UPDATE_MESSAGE', messageHandler.updateMessageById)).to.be
        .true;
    });
  });

  describe('ARCHIVE_MESSAGE', () => {
    it('should call archiveMessageById', () => {
      expect(socket.on.calledWithExactly('ARCHIVE_MESSAGE', messageHandler.archiveMessageById)).to
        .be.true;
    });
  });

  describe('DELETE_MESSAGE', () => {
    it('should call deleteMessageById', () => {
      expect(socket.on.calledWithExactly('DELETE_MESSAGE', messageHandler.deleteMessageById)).to.be
        .true;
    });
  });
});
