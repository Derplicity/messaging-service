const sinon = require('sinon');
const { expect } = require('chai');

const Author = require('../../../src/data/models/Author');
const Room = require('../../../src/data/models/Room');
const helpers = require('../../../src/util/helpers');
const uuid = require('../../../src/util/uuid');

describe('Room Model', () => {
  const validRoomId = '1e087de1-59d0-4dcb-8f7e-01e4860f5c2d';
  const validRoom = {
    name: 'Chat',
    authors: [{ author: 'd462b0d5-0bcd-464f-b209-517481b3990a', isActive: false }],
    isArchived: true,
  };

  beforeEach(() => {
    sinon.stub(uuid, 'generate').returns(validRoomId);
    sinon.stub(uuid, 'validate').returns(true);
    sinon.stub(helpers, 'arrayHasDuplicates').returns(false);
    sinon.stub(Author, 'findById').returns({ _id: validRoom.authors[0].author });
  });

  afterEach(() => {
    uuid.generate.restore();
    uuid.validate.restore();
    helpers.arrayHasDuplicates.restore();
    Author.findById.restore();
  });

  it('should create valid Room', (done) => {
    const room = new Room(validRoom);

    room.validate((err) => {
      expect(err).to.not.exist;
      expect(room._id).to.equal(validRoomId);
      expect(room.name).to.equal(validRoom.name);

      expect(uuid.generate.called).to.be.true;
      expect(helpers.arrayHasDuplicates.called).to.be.true;
      expect(helpers.arrayHasDuplicates.calledWith([validRoom.authors[0].author]));

      room.authors.forEach((author, i) => {
        const expectedAuthor = validRoom.authors[i];

        expect(author.author).to.equal(expectedAuthor.author);
        expect(author.isActive).to.equal(expectedAuthor.isActive);

        expect(uuid.validate.calledWith(expectedAuthor.author)).to.be.true;
        expect(Author.findById.calledWith(expectedAuthor.author)).to.be.true;
      });

      expect(room.isArchived).to.equal(validRoom.isArchived);

      done();
    });
  });

  it('should be invalid if name is empty', (done) => {
    const invalidRoom = { ...validRoom };
    delete invalidRoom.name;

    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.name).to.exist;

      done();
    });
  });

  it('should be invalid if name is invalid', (done) => {
    const invalidRoom = { ...validRoom, name: '' };
    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.name).to.exist;

      done();
    });
  });

  it('should be invalid if authors.author (id) is invalid', (done) => {
    uuid.validate.returns(false);

    const invalidRoom = { ...validRoom };
    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.authors).to.exist;

      room.authors.forEach((author, i) => {
        const expectedAuthor = invalidRoom.authors[i];

        expect(uuid.validate.calledWith(expectedAuthor.author)).to.be.true;
      });

      done();
    });
  });

  it('should be invalid if authors.author does not exist', (done) => {
    Author.findById.returns(null);

    const invalidRoom = { ...validRoom };
    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.authors).to.exist;

      room.authors.forEach((author, i) => {
        const expectedAuthor = invalidRoom.authors[i];

        expect(Author.findById.calledWith(expectedAuthor.author)).to.be.true;
      });

      done();
    });
  });

  it('should be invalid if authors contains duplicates', (done) => {
    helpers.arrayHasDuplicates.returns(true);

    const invalidRoom = { ...validRoom };
    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.authors).to.exist;

      expect(helpers.arrayHasDuplicates.calledWith([invalidRoom.authors[0].author]));

      done();
    });
  });

  it('should default authors.isActive to true if authors.isActive is empty', (done) => {
    const validRoomWithDefault = { ...validRoom };
    validRoomWithDefault.authors = validRoomWithDefault.authors.map((author) => {
      const authorWithDefault = author;
      delete authorWithDefault.isActive;

      return authorWithDefault;
    });

    const room = new Room(validRoomWithDefault);

    room.validate((err) => {
      expect(err).to.not.exist;

      room.authors.forEach((author) => {
        expect(author.isActive).to.be.true;
      });

      done();
    });
  });

  it('should be invalid if authors.isActive is invalid', (done) => {
    const invalidRoom = { ...validRoom };
    invalidRoom.authors = invalidRoom.authors.map((author) => ({
      ...author,
      isActive: '',
    }));

    const room = new Room(invalidRoom);

    room.validate((err) => {
      room.authors.forEach((author, i) => {
        expect(err.errors[`authors.${i}.isActive`]).to.exist;
      });

      done();
    });
  });

  it('should default isArchived to false if isArchived is empty', (done) => {
    const validRoomWithDefault = { ...validRoom };
    delete validRoomWithDefault.isArchived;

    const room = new Room(validRoomWithDefault);

    room.validate((err) => {
      expect(err).to.not.exist;
      expect(room.isArchived).to.be.false;
      done();
    });
  });

  it('should be invalid if isArchived is invalid', (done) => {
    const invalidRoom = { ...validRoom, isArchived: '' };
    const room = new Room(invalidRoom);

    room.validate((err) => {
      expect(err.errors.isArchived).to.exist;
      done();
    });
  });
});
