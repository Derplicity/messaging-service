const sinon = require('sinon');
const { expect } = require('chai');

const Author = require('../../../src/data/models/Author');
const Message = require('../../../src/data/models/Message');
const Room = require('../../../src/data/models/Room');
const uuid = require('../../../src/util/uuid');

describe('Message Model', () => {
  const validMessageId = '4d6f1c70-7ce1-41e4-8432-7de0e84fb5ab';
  const validMessage = {
    roomId: '9e811b86-ddf2-48b2-9f3c-2bc1c19eac27',
    authorId: 'c0b69bc8-be3a-471d-a0ac-89858143c694',
    text: 'test text',
    isArchived: true,
  };

  beforeEach(() => {
    sinon.stub(uuid, 'generate').returns(validMessageId);
    sinon.stub(uuid, 'validate').returns(true);
    sinon
      .stub(Room, 'findById')
      .returns({ _id: validMessage.roomId, authors: [{ author: validMessage.authorId }] });
    sinon.stub(Author, 'findById').returns({ _id: validMessage.authorId });
  });

  afterEach(() => {
    uuid.generate.restore();
    uuid.validate.restore();
    Room.findById.restore();
    Author.findById.restore();
  });

  it('should create valid Message', (done) => {
    const message = new Message(validMessage);

    message.validate((err) => {
      expect(err).to.not.exist;
      expect(message._id).to.equal(validMessageId);
      expect(message.roomId).to.equal(validMessage.roomId);
      expect(message.authorId).to.equal(validMessage.authorId);
      expect(message.text).to.equal(validMessage.text);
      expect(message.isArchived).to.equal(validMessage.isArchived);

      expect(uuid.generate.called).to.be.true;
      expect(uuid.validate.calledWith(validMessage.roomId)).to.be.true;
      expect(Room.findById.calledWith(validMessage.roomId)).to.be.true;
      expect(uuid.validate.calledWith(validMessage.authorId)).to.be.true;
      expect(Author.findById.calledWith(validMessage.authorId)).to.be.true;

      done();
    });
  });

  it('should be invalid if roomId is empty', (done) => {
    const invalidMessage = { ...validMessage };
    delete invalidMessage.roomId;

    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.roomId).to.exist;

      done();
    });
  });

  it('should be invalid if roomId is invalid', (done) => {
    uuid.validate.returns(false);

    const invalidMessage = { ...validMessage };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.roomId).to.exist;

      done();
    });
  });

  it('should be invalid if room with roomId does not exist', (done) => {
    Room.findById.returns(null);

    const invalidMessage = { ...validMessage };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.roomId).to.exist;

      expect(Room.findById.calledWith(invalidMessage.roomId));

      done();
    });
  });

  it('should be invalid if authorId is empty', (done) => {
    const invalidMessage = { ...validMessage };
    delete invalidMessage.authorId;

    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.authorId).to.exist;

      done();
    });
  });

  it('should be invalid if authorId is invalid', (done) => {
    uuid.validate.returns(false);

    const invalidMessage = { ...validMessage };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.authorId).to.exist;

      done();
    });
  });

  it('should be invalid if author with authorId does not exist', (done) => {
    Author.findById.returns(null);

    const invalidMessage = { ...validMessage };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.authorId).to.exist;

      expect(Author.findById.calledWith(invalidMessage.authorId));

      done();
    });
  });

  it('should be invalid if room with authorId does not exist', (done) => {
    Room.findById.returns({ authors: [] });

    const invalidMessage = { ...validMessage };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.authorId).to.exist;

      expect(Room.findById.calledWith(invalidMessage.roomId));

      done();
    });
  });

  it('should be invalid if text is empty', (done) => {
    const invalidMessage = { ...validMessage };
    delete invalidMessage.text;

    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.text).to.exist;

      done();
    });
  });

  it('should be invalid if text is invalid', (done) => {
    const invalidMessage = { ...validMessage, text: '' };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.text).to.exist;

      done();
    });
  });

  it('should default isArchived to false if isArchived is empty', (done) => {
    const validMessageWithDefault = { ...validMessage };
    delete validMessageWithDefault.isArchived;

    const message = new Message(validMessageWithDefault);

    message.validate((err) => {
      expect(err).to.not.exist;
      expect(message.isArchived).to.equal(false);
      done();
    });
  });

  it('should be invalid if isArchived is invalid', (done) => {
    const invalidMessage = { ...validMessage, isArchived: '' };
    const message = new Message(invalidMessage);

    message.validate((err) => {
      expect(err.errors.isArchived).to.exist;
      done();
    });
  });
});
