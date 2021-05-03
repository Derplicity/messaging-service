const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const messageController = require('../../../src/api/controllers/messages');
const messageRepository = require('../../../src/data/repositories/message');

describe('Message Controller', () => {
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

  describe('createMessage', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'createMessage');
    });

    afterEach(() => {
      messageRepository.createMessage.restore();
    });

    it('should return created Message', async () => {
      const baseUrl = '/test/url';
      const body = {
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: 'test_text',
      };
      const creationArgs = {
        roomId: body.roomId,
        authorId: body.authorId,
        text: body.text,
      };
      const createdMessage = {
        _id: '86096581-8169-4c0c-8470-2a334e541d13',
        roomId: creationArgs.roomId,
        authorId: creationArgs.authorId,
        text: creationArgs.text,
        isArchived: false,
      };

      const expectedStatus = 201;
      const expectedLocation = `${baseUrl}/${createdMessage._id}`;
      const expectedJson = { message: createdMessage };

      messageRepository.createMessage.returns(createdMessage);

      routeParams.req = { ...routeParams.req, body, baseUrl };
      routeParams.res = { ...routeParams.res, location: sinon.stub() };

      await messageController.createMessage(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.createMessage.calledWithMatch(creationArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(res.location.calledWith(expectedLocation)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const body = {
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: 'test_text',
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.createMessage.throws(expectedError);

      routeParams.req = { ...routeParams.req, body };

      await messageController.createMessage(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getAllMessages', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'getAllMessages');
    });

    afterEach(() => {
      messageRepository.getAllMessages.restore();
    });

    it('should return list of Messages', async () => {
      const query = {
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        includeArchived: true,
        createdBefore: Date.UTC(2021),
        limit: 10,
      };
      const fetchArgs = {
        roomId: query.roomId,
        authorId: query.authorId,
        includeArchived: query.includeArchived,
        createdBefore: query.createdBefore,
        limit: query.limit,
      };
      const fetchedMessages = [
        {
          _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
          roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
          authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
          text: 'test_text1',
          isArchived: false,
        },
        {
          id: '54350cdd-ea19-458d-9d7c-8f10b701cfda',
          roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
          authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
          text: 'test_text2',
          isArchived: true,
        },
      ];

      const expectedStatus = 200;
      const expectedJson = { messages: fetchedMessages };

      messageRepository.getAllMessages.returns(fetchedMessages);

      routeParams.req = { ...routeParams.req, query };

      await messageController.getAllMessages(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.getAllMessages.calledWithMatch(fetchArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const query = {
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        includeArchived: true,
        createdBefore: Date.UTC(2021),
        limit: 10,
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.getAllMessages.throws(expectedError);

      routeParams.req = { ...routeParams.req, query };

      await messageController.getAllMessages(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getMessageById', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'getMessageById');
    });

    afterEach(() => {
      messageRepository.getMessageById.restore();
    });

    it('should return requested Message', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { messageId } = params;
      const fetchedMessage = {
        _id: messageId,
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: 'test_text',
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { message: fetchedMessage };

      messageRepository.getMessageById.returns(fetchedMessage);

      routeParams.req = { ...routeParams.req, params };

      await messageController.getMessageById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.getMessageById.calledWith(messageId)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Message not found', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      messageRepository.getMessageById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await messageController.getMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Message not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.getMessageById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await messageController.getMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('updateMessageById', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'updateMessageById');
    });

    afterEach(() => {
      messageRepository.updateMessageById.restore();
    });

    it('should return updated Message', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        text: 'updated_test_text',
      };
      const { messageId } = params;
      const updateArgs = {
        text: body.text,
      };
      const updatedMessage = {
        _id: messageId,
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: updateArgs.text,
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { message: updatedMessage };

      messageRepository.updateMessageById.returns(updatedMessage);

      routeParams.req = { ...routeParams.req, body, params };

      await messageController.updateMessageById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.updateMessageById.calledWithMatch(messageId, updateArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Message not found', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        text: 'updated_test_text',
      };

      messageRepository.updateMessageById.returns(null);

      routeParams.req = { ...routeParams.req, body, params };

      await messageController.updateMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Message not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        text: 'updated_test_text',
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.updateMessageById.throws(expectedError);

      routeParams.req = { ...routeParams.req, body, params };

      await messageController.updateMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('archiveMessageById', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'archiveMessageById');
    });

    afterEach(() => {
      messageRepository.archiveMessageById.restore();
    });

    it('should return archived Message', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { messageId } = params;
      const archivedMessage = {
        _id: messageId,
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: 'test_text',
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { message: archivedMessage };

      messageRepository.archiveMessageById.returns(archivedMessage);

      routeParams.req = { ...routeParams.req, params };

      await messageController.archiveMessageById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.archiveMessageById.calledWith(messageId)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Message not found', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      messageRepository.archiveMessageById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await messageController.archiveMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Message not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.archiveMessageById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await messageController.archiveMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('deleteMessageById', () => {
    beforeEach(() => {
      sinon.stub(messageRepository, 'deleteMessageById');
    });

    afterEach(() => {
      messageRepository.deleteMessageById.restore();
    });

    it('should return deleted Message id', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { messageId } = params;
      const deletedMessage = {
        _id: messageId,
        roomId: 'a7318ef1-454d-4e05-9312-454e0c66e32c',
        authorId: '52a9240f-720c-4293-b63d-a4b17849d5d8',
        text: 'test_text',
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { message: deletedMessage };

      messageRepository.deleteMessageById.returns(deletedMessage);

      routeParams.req = { ...routeParams.req, params };

      await messageController.deleteMessageById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(messageRepository.deleteMessageById.calledWith(messageId)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Message not found', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      messageRepository.deleteMessageById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await messageController.deleteMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Message not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { messageId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      messageRepository.deleteMessageById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await messageController.deleteMessageById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });
});
