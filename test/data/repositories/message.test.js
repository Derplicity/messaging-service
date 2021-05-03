const sinon = require('sinon');
const { expect } = require('chai');

const messageRepository = require('../../../src/data/repositories/message');
const Message = require('../../../src/data/models/Message');
const { MAX_TIMESTAMP } = require('../../../src/util/constants');

describe('Message Repository', () => {
  describe('createMessage', () => {
    it('should create and return Message', async () => {
      const creationArgs = {
        roomId: 'f49cb2a3-40f9-42e4-8cab-93a2df3ad0a9',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
      };
      const expectedMessage = {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        roomId: creationArgs.roomId,
        authorId: creationArgs.authorId,
        text: creationArgs.text,
        isArchived: false,
      };

      sinon.stub(Message.prototype, 'save').returnsThis();
      sinon.stub(Message.prototype, 'toObject').returns(expectedMessage);

      const response = await messageRepository.createMessage(creationArgs);

      expect(Message.prototype.save.called).to.be.true;
      expect(Message.prototype.toObject.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);

      Message.prototype.save.restore();
      Message.prototype.toObject.restore();
    });
  });

  describe('getAllMessages', () => {
    const expectedMessages = [
      {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
        isArchived: false,
      },
      {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text2',
        isArchived: true,
      },
    ];

    let query;

    beforeEach(() => {
      query = {
        where: sinon.stub().returnsThis(),
        equals: sinon.stub().returnsThis(),
        lt: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedMessages),
      };
      sinon.stub(Message, 'find').returns(query);
    });

    afterEach(() => {
      Message.find.restore();
    });

    it('should get and return list of Messages with default query params', async () => {
      const defaultQueryParams = {
        roomId: '',
        authorId: '',
        includeArchived: 0,
        createdBefore: MAX_TIMESTAMP,
        limit: 10,
      };
      const response = await messageRepository.getAllMessages({});

      expect(Message.find.called).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.roomId)).to.be.false;
      expect(query.where.calledWith('authorId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.authorId)).to.be.false;
      expect(query.where.calledWith('isArchived')).to.be.true;
      expect(query.equals.calledWith(false)).to.be.true;
      expect(query.where.calledWith('createdAt')).to.be.true;
      expect(
        query.lt.calledWith(
          sinon.match
            .instanceOf(Date)
            .and(sinon.match((value) => value.valueOf() === defaultQueryParams.createdBefore)),
        ),
      ).to.be.true;
      expect(query.sort.calledWith('-createdAt')).to.be.true;
      expect(query.limit.calledWith(defaultQueryParams.limit)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessages);
    });

    it('should get and return list of Messages with custom query params', async () => {
      const expectedQueryParams = {
        roomId: 'f49cb2a3-40f9-42e4-8cab-93a2df3ad0a9',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        includeArchived: 1,
        createdBefore: Date.UTC(2021),
        limit: 5,
      };
      const response = await messageRepository.getAllMessages(expectedQueryParams);

      expect(Message.find.called).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.roomId)).to.be.true;
      expect(query.where.calledWith('authorId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.authorId)).to.be.true;
      expect(query.where.calledWith('isArchived')).to.be.false;
      expect(query.equals.calledWith(false)).to.be.false;
      expect(query.where.calledWith('createdAt')).to.be.true;
      expect(
        query.lt.calledWith(
          sinon.match
            .instanceOf(Date)
            .and(sinon.match((value) => value.valueOf() === expectedQueryParams.createdBefore)),
        ),
      ).to.be.true;
      expect(query.sort.calledWith('-createdAt')).to.be.true;
      expect(query.limit.calledWith(expectedQueryParams.limit)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessages);
    });
  });

  describe('getMessageById', () => {
    it('should get and return Message with given id', async () => {
      const messageId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedMessage = {
        _id: messageId,
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedMessage),
      };

      sinon.stub(Message, 'findById').returns(query);

      const response = await messageRepository.getMessageById(messageId);

      expect(Message.findById.calledWith(expectedMessage._id)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);

      Message.findById.restore();
    });
  });

  describe('updateMessageById', () => {
    const messageId = '81f24773-2df3-4d37-b61a-c526328be6f3';
    const expectedMessage = {
      _id: messageId,
      roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
      authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
      text: 'test_text',
      isArchived: false,
    };

    let query;

    beforeEach(() => {
      query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedMessage),
      };

      sinon.stub(Message, 'findByIdAndUpdate').returns(query);
    });

    afterEach(() => {
      Message.findByIdAndUpdate.restore();
    });

    it('should update and return Message with given id and default params', async () => {
      const response = await messageRepository.updateMessageById(messageId, {});

      expect(
        Message.findByIdAndUpdate.calledWithMatch(
          expectedMessage._id,
          { text: '' },
          { new: true, runValidators: true },
        ),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);
    });

    it('should update and return Message with given id and custom params', async () => {
      const updateArgs = {
        text: expectedMessage.text,
      };
      const response = await messageRepository.updateMessageById(messageId, updateArgs);

      expect(
        Message.findByIdAndUpdate.calledWithMatch(expectedMessage._id, updateArgs, {
          new: true,
          runValidators: true,
        }),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);
    });
  });

  describe('archiveMessageById', () => {
    it('should archive and return Message with given id', async () => {
      const messageId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedMessage = {
        _id: messageId,
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedMessage),
      };

      sinon.stub(Message, 'findByIdAndUpdate').returns(query);

      const response = await messageRepository.archiveMessageById(messageId);

      expect(
        Message.findByIdAndUpdate.calledWithMatch(
          expectedMessage._id,
          { isArchived: true },
          {
            new: true,
            runValidators: true,
          },
        ),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);

      Message.findByIdAndUpdate.restore();
    });
  });

  describe('deleteMessageById', () => {
    it('should delete and return the Message', async () => {
      const messageId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedMessage = {
        _id: messageId,
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedMessage),
      };

      sinon.stub(Message, 'findByIdAndDelete').returns(query);

      const response = await messageRepository.deleteMessageById(messageId);

      expect(Message.findByIdAndDelete.calledWith(expectedMessage._id)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedMessage);

      Message.findByIdAndDelete.restore();
    });

    it('should return null if the Message does not exist', async () => {
      const invalidId = '81f24773-2df3-4d37-b61a-c526328be6f3';

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(null),
      };

      sinon.stub(Message, 'findByIdAndDelete').returns(query);

      const response = await messageRepository.deleteMessageById(invalidId);

      expect(Message.findByIdAndDelete.calledWith(invalidId)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.be.null;

      Message.findByIdAndDelete.restore();
    });
  });

  describe('archiveAllMessages', () => {
    const expectedResponse = {
      ok: true,
    };

    let query;

    beforeEach(() => {
      query = {
        where: sinon.stub().returnsThis(),
        equals: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedResponse),
      };
      sinon.stub(Message, 'updateMany').returns(query);
    });

    afterEach(() => {
      Message.updateMany.restore();
    });

    it('should archive all Messages with default attributes', async () => {
      const defaultQueryParams = {
        roomId: '',
        authorId: '',
      };
      const response = await messageRepository.archiveAllMessages({});

      expect(Message.updateMany.calledWithMatch({}, { isArchived: true })).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.roomId)).to.be.false;
      expect(query.where.calledWith('authorId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.authorId)).to.be.false;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.equals(expectedResponse.ok);
    });

    it('should archive all Messages with custom attributes', async () => {
      const expectedQueryParams = {
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
      };
      const response = await messageRepository.archiveAllMessages(expectedQueryParams);

      expect(Message.updateMany.calledWithMatch({}, { isArchived: true })).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.roomId)).to.be.true;
      expect(query.where.calledWith('authorId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.authorId)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.equals(expectedResponse.ok);
    });
  });

  describe('deleteAllMessages', () => {
    const expectedResponse = {
      ok: true,
    };

    let query;

    beforeEach(() => {
      query = {
        where: sinon.stub().returnsThis(),
        equals: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedResponse),
      };
      sinon.stub(Message, 'deleteMany').returns(query);
    });

    afterEach(() => {
      Message.deleteMany.restore();
    });

    it('should delete all Messages with default attributes', async () => {
      const defaultQueryParams = {
        roomId: '',
        authorId: '',
      };
      const response = await messageRepository.deleteAllMessages({});

      expect(Message.deleteMany.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.roomId)).to.be.false;
      expect(query.where.calledWith('authorId')).to.be.false;
      expect(query.equals.calledWith(defaultQueryParams.authorId)).to.be.false;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.equals(expectedResponse.ok);
    });

    it('should delete all Messages with custom attributes', async () => {
      const expectedQueryParams = {
        roomId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
      };
      const response = await messageRepository.deleteAllMessages(expectedQueryParams);

      expect(Message.deleteMany.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('roomId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.roomId)).to.be.true;
      expect(query.where.calledWith('authorId')).to.be.true;
      expect(query.equals.calledWith(expectedQueryParams.authorId)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.equals(expectedResponse.ok);
    });
  });
});
