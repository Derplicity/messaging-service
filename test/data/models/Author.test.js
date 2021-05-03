const sinon = require('sinon');
const { expect } = require('chai');

const Author = require('../../../src/data/models/Author');
const uuid = require('../../../src/util/uuid');

describe('Author Model', () => {
  const validAuthor = {
    _id: '41668507-6033-4d14-a6e0-8c9af94e92ab',
    firstName: 'John',
    lastName: 'Doe',
    isArchived: true,
  };

  beforeEach(() => {
    sinon.stub(uuid, 'validate').returns(true);
  });

  afterEach(() => {
    uuid.validate.restore();
  });

  it('should create valid Author', (done) => {
    const author = new Author(validAuthor);

    author.validate((err) => {
      expect(err).to.not.exist;
      expect(author._id).to.equal(validAuthor._id);
      expect(author.firstName).to.equal(validAuthor.firstName);
      expect(author.lastName).to.equal(validAuthor.lastName);
      expect(author.isArchived).to.equal(validAuthor.isArchived);

      expect(uuid.validate.called).to.be.true;
      expect(uuid.validate.calledWith(validAuthor._id)).to.be.true;

      done();
    });
  });

  it('should be invalid if _id is empty', (done) => {
    const invalidAuthor = { ...validAuthor };
    delete invalidAuthor._id;

    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors._id).to.exist;
      done();
    });
  });

  it('should be invalid if UUID validation fails', (done) => {
    uuid.validate.returns(false);

    const author = new Author(validAuthor);

    author.validate((err) => {
      expect(err.errors._id).to.exist;

      expect(uuid.validate.called).to.be.true;

      done();
    });
  });

  it('should be invalid if firstName is empty', (done) => {
    const invalidAuthor = { ...validAuthor };
    delete invalidAuthor.firstName;

    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors.firstName).to.exist;
      done();
    });
  });

  it('should be invalid if firstName is invalid', (done) => {
    const invalidAuthor = { ...validAuthor, firstName: '' };
    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors.firstName).to.exist;
      done();
    });
  });

  it('should be invalid if lastName is empty', (done) => {
    const invalidAuthor = { ...validAuthor };
    delete invalidAuthor.lastName;

    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors.lastName).to.exist;
      done();
    });
  });

  it('should be invalid if lastName is invalid', (done) => {
    const invalidAuthor = { ...validAuthor, lastName: '' };
    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors.lastName).to.exist;
      done();
    });
  });

  it('should default isArchived to false if isArchived is empty', (done) => {
    const validAuthorWithDefault = { ...validAuthor };
    delete validAuthorWithDefault.isArchived;

    const author = new Author(validAuthorWithDefault);

    author.validate((err) => {
      expect(err).to.not.exist;
      expect(author.isArchived).to.be.false;
      done();
    });
  });

  it('should be invalid if isArchived is invalid', (done) => {
    const invalidAuthor = { ...validAuthor, isArchived: '' };
    const author = new Author(invalidAuthor);

    author.validate((err) => {
      expect(err.errors.isArchived).to.exist;
      done();
    });
  });
});
