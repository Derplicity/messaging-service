const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const errorUtils = require('../../../src/util/errorUtils');
const messageHandler = require('../../../src/api/handlers/messages');
const messageRepository = require('../../../src/data/repositories/message');
const roomRepository = require('../../../src/data/repositories/room');

describe('Message Handler', () => {
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

  describe('createMessage', () => {
    let fakeCreateMessage;

    beforeEach(() => {
      fakeCreateMessage = messageHandler.createMessage.bind(socket);
      sinon.stub(messageRepository, 'createMessage');
      sinon.stub(roomRepository, 'getRoomById');
    });

    afterEach(() => {
      messageRepository.createMessage.restore();
      roomRepository.getRoomById.restore();
    });

    it('should create, emit and return new Message', async () => {
      const cb = sinon.stub();
      const creationArgs = {
        roomId: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        authorId: 'fcaf80ca-cf97-4a9f-8427-2085b6834efe',
        text: 'test_text',
      };
      const reqArgs = [
        {
          roomId: creationArgs.roomId,
          authorId: creationArgs.authorId,
          text: creationArgs.text,
        },
        cb,
      ];
      const createdMessage = {
        _id: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        roomId: creationArgs.roomId,
        authorId: creationArgs.authorId,
        text: creationArgs.text,
        isArchived: false,
      };
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7', isActive: true };
      const author2 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7', isActive: false };
      const fetchedRoom = { authors: [author1, author2] };

      const expectedType = 'MESSAGE_CREATED';
      const expectedRes = { message: createdMessage };

      messageRepository.createMessage.returns(createdMessage);
      roomRepository.getRoomById.returns(fetchedRoom);

      await fakeCreateMessage(...reqArgs);

      expect(messageRepository.createMessage.calledWithMatch(creationArgs)).to.be.true;
      expect(roomRepository.getRoomById.calledWithMatch(creationArgs.roomId)).to.be.true;
      expect(socket.to.calledWithMatch(author1._id)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return error if error thrown', async () => {
      const cb = sinon.stub();
      const creationArgs = {
        roomId: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        authorId: 'fcaf80ca-cf97-4a9f-8427-2085b6834efe',
        text: 'test_text',
      };
      const reqArgs = [
        {
          roomId: creationArgs.roomId,
          authorId: creationArgs.authorId,
          text: creationArgs.text,
        },
        cb,
      ];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.createMessage.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeCreateMessage(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('updateMessageById', () => {
    let fakeUpdateMessageById;

    beforeEach(() => {
      fakeUpdateMessageById = messageHandler.updateMessageById.bind(socket);
      sinon.stub(messageRepository, 'updateMessageById');
    });

    afterEach(() => {
      messageRepository.updateMessageById.restore();
    });

    it('should emit and return updated Message', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        text: 'test_text',
      };
      const reqArgs = [
        {
          id: messageId,
          updateValues: {
            text: updateArgs.text,
          },
        },
        cb,
      ];
      const updatedMessage = {
        _id: messageId,
        roomId: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        authorId: 'fcaf80ca-cf97-4a9f-8427-2085b6834efe',
        text: updateArgs.text,
        isArchived: false,
      };

      const expectedType = 'MESSAGE_UPDATED';
      const expectedRes = { message: updatedMessage };

      messageRepository.updateMessageById.returns(updatedMessage);

      await fakeUpdateMessageById(...reqArgs);

      expect(messageRepository.updateMessageById.calledWithMatch(messageId, updateArgs)).to.be.true;
      expect(socket.to.calledWithMatch(updatedMessage.roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Message not found', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        text: 'test_text',
      };
      const reqArgs = [
        {
          id: messageId,
          updateValues: {
            text: updateArgs.text,
          },
        },
        cb,
      ];

      const expectedError = { message: 'Message not found.' };

      messageRepository.updateMessageById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeUpdateMessageById(...reqArgs);

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
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const updateArgs = {
        text: 'test_text',
      };
      const reqArgs = [
        {
          id: messageId,
          updateValues: {
            text: updateArgs.text,
          },
        },
        cb,
      ];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.updateMessageById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeUpdateMessageById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('archiveMessageById', () => {
    let fakeArchiveMessageById;

    beforeEach(() => {
      fakeArchiveMessageById = messageHandler.archiveMessageById.bind(socket);
      sinon.stub(messageRepository, 'archiveMessageById');
    });

    afterEach(() => {
      messageRepository.archiveMessageById.restore();
    });

    it('should emit and return archived Message', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];
      const archivedMessage = {
        _id: messageId,
        roomId: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        authorId: 'fcaf80ca-cf97-4a9f-8427-2085b6834efe',
        text: 'test_text',
        isArchived: true,
      };

      const expectedType = 'MESSAGE_ARCHIVED';
      const expectedRes = { message: archivedMessage };

      messageRepository.archiveMessageById.returns(archivedMessage);

      await fakeArchiveMessageById(...reqArgs);

      expect(messageRepository.archiveMessageById.calledWith(messageId)).to.be.true;
      expect(socket.to.calledWithMatch(archivedMessage.roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Message not found', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];

      const expectedError = { message: 'Message not found.' };

      messageRepository.archiveMessageById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeArchiveMessageById(...reqArgs);

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
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.archiveMessageById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeArchiveMessageById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('deleteMessageById', () => {
    let fakeDeleteMessageById;

    beforeEach(() => {
      fakeDeleteMessageById = messageHandler.deleteMessageById.bind(socket);
      sinon.stub(messageRepository, 'deleteMessageById');
    });

    afterEach(() => {
      messageRepository.deleteMessageById.restore();
    });

    it('should emit and return deleted Message', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];
      const deletedMessage = {
        _id: messageId,
        roomId: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        authorId: 'fcaf80ca-cf97-4a9f-8427-2085b6834efe',
        text: 'test_text',
        isArchived: true,
      };

      const expectedType = 'MESSAGE_DELETED';
      const expectedRes = { message: deletedMessage };

      messageRepository.deleteMessageById.returns(deletedMessage);

      await fakeDeleteMessageById(...reqArgs);

      expect(messageRepository.deleteMessageById.calledWith(messageId)).to.be.true;
      expect(socket.to.calledWithMatch(deletedMessage.roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Message not found', async () => {
      const cb = sinon.stub();
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];

      const expectedError = { message: 'Message not found.' };

      messageRepository.deleteMessageById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeDeleteMessageById(...reqArgs);

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
      const messageId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: messageId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.deleteMessageById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeDeleteMessageById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });
});
