const sinon = require('sinon');
const { expect } = require('chai');

const authorRepository = require('../../../src/data/repositories/author');
const Author = require('../../../src/data/models/Author');
const { MAX_TIMESTAMP } = require('../../../src/util/constants');

describe('Author Repository', () => {
  describe('createAuthor', () => {
    it('should create and return Author', async () => {
      const creationArgs = {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        firstName: 'John',
        lastName: 'Doe',
      };
      const expectedAuthor = {
        _id: creationArgs._id,
        firstName: creationArgs.firstName,
        lastName: creationArgs.lastName,
        isArchived: false,
      };

      sinon.stub(Author.prototype, 'save').returnsThis();
      sinon.stub(Author.prototype, 'toObject').returns(expectedAuthor);

      const response = await authorRepository.createAuthor(creationArgs);

      expect(Author.prototype.save.called).to.be.true;
      expect(Author.prototype.toObject.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);

      Author.prototype.save.restore();
      Author.prototype.toObject.restore();
    });
  });

  describe('getAllAuthors', () => {
    const expectedAuthors = [
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

    let query;

    beforeEach(() => {
      query = {
        where: sinon.stub().returnsThis(),
        equals: sinon.stub().returnsThis(),
        lt: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedAuthors),
      };
      sinon.stub(Author, 'find').returns(query);
    });

    afterEach(() => {
      Author.find.restore();
    });

    it('should get and return list of Authors with default query params', async () => {
      const defaultQueryParams = {
        includeArchived: 0,
        createdBefore: MAX_TIMESTAMP,
        limit: 10,
      };
      const response = await authorRepository.getAllAuthors({});

      expect(Author.find.called).to.be.true;
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

      expect(response).to.deep.equals(expectedAuthors);
    });

    it('should get and return list of Authors with custom query params', async () => {
      const expectedQueryParams = {
        includeArchived: 1,
        createdBefore: Date.UTC(2021),
        limit: 5,
      };
      const response = await authorRepository.getAllAuthors(expectedQueryParams);

      expect(Author.find.called).to.be.true;
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

      expect(response).to.deep.equals(expectedAuthors);
    });
  });

  describe('getAuthorById', () => {
    it('should get and return Author with given id', async () => {
      const authorId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedAuthor),
      };

      sinon.stub(Author, 'findById').returns(query);

      const response = await authorRepository.getAuthorById(authorId);

      expect(Author.findById.calledWith(expectedAuthor._id)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);

      Author.findById.restore();
    });
  });

  describe('updateAuthorById', () => {
    const authorId = '81f24773-2df3-4d37-b61a-c526328be6f3';
    const expectedAuthor = {
      _id: authorId,
      firstName: 'John',
      lastName: 'Doe',
      isArchived: false,
    };

    let query;

    beforeEach(() => {
      query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedAuthor),
      };

      sinon.stub(Author, 'findByIdAndUpdate').returns(query);
    });

    afterEach(() => {
      Author.findByIdAndUpdate.restore();
    });

    it('should update and return Author with given id and default params', async () => {
      const response = await authorRepository.updateAuthorById(authorId, {});

      expect(
        Author.findByIdAndUpdate.calledWithMatch(
          expectedAuthor._id,
          { firstName: '', lastName: '' },
          { new: true, runValidators: true },
        ),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);
    });

    it('should update and return Author with given id and custom params', async () => {
      const updateArgs = {
        firstName: expectedAuthor.firstName,
        lastName: expectedAuthor.lastName,
      };
      const response = await authorRepository.updateAuthorById(authorId, updateArgs);

      expect(
        Author.findByIdAndUpdate.calledWithMatch(expectedAuthor._id, updateArgs, {
          new: true,
          runValidators: true,
        }),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);
    });
  });

  describe('archiveAuthorById', () => {
    it('should archive and return Author with given id', async () => {
      const authorId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedAuthor),
      };

      sinon.stub(Author, 'findByIdAndUpdate').returns(query);

      const response = await authorRepository.archiveAuthorById(authorId);

      expect(
        Author.findByIdAndUpdate.calledWithMatch(
          expectedAuthor._id,
          { isArchived: true },
          {
            new: true,
            runValidators: true,
          },
        ),
      ).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);

      Author.findByIdAndUpdate.restore();
    });
  });

  describe('deleteAuthorById', () => {
    it('should delete and return the Author', async () => {
      const authorId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedAuthor = {
        _id: authorId,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedAuthor),
      };

      sinon.stub(Author, 'findByIdAndDelete').returns(query);

      const response = await authorRepository.deleteAuthorById(authorId);

      expect(Author.findByIdAndDelete.calledWith(expectedAuthor._id)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedAuthor);

      Author.findByIdAndDelete.restore();
    });

    it('should return null if the Author does not exist', async () => {
      const invalidId = '81f24773-2df3-4d37-b61a-c526328be6f3';

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(null),
      };

      sinon.stub(Author, 'findByIdAndDelete').returns(query);

      const response = await authorRepository.deleteAuthorById(invalidId);

      expect(Author.findByIdAndDelete.calledWith(invalidId)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.be.null;

      Author.findByIdAndDelete.restore();
    });
  });
});
