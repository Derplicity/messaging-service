const sinon = require('sinon');
const { expect } = require('chai');

const roomRepository = require('../../../src/data/repositories/room');
const Room = require('../../../src/data/models/Room');
const Message = require('../../../src/data/models/Message');
const { MAX_TIMESTAMP } = require('../../../src/util/constants');

describe('Room Repository', () => {
  describe('createRoom', () => {
    it('should create and return Room with authors', async () => {
      const creationArgs = {
        name: 'test_room',
        authors: [
          { _id: 'f49cb2a3-40f9-42e4-8cab-93a2df3ad0a9' },
          { _id: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5' },
        ],
      };
      const expectedRoom = {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        name: creationArgs.name,
        authors: [
          {
            author: creationArgs.authors[0]._id,
            isActive: true,
          },
          {
            author: creationArgs.authors[1]._id,
            isActive: true,
          },
        ],
        isArchived: false,
      };
      const expectedPopulatedRoom = {
        ...expectedRoom,
        authors: [
          {
            _id: creationArgs.authors[0]._id,
            firstName: 'John',
            lastName: 'Doe',
            isArchived: false,
            isActive: true,
          },
          {
            _id: creationArgs.authors[1]._id,
            firstName: 'Sam',
            lastName: 'Smith',
            isArchived: false,
            isActive: true,
          },
        ],
      };

      sinon.stub(Room.prototype, 'save').returns(expectedRoom);
      sinon.stub(Room, 'populate').returns(Room.prototype);
      sinon.stub(Room.prototype, 'toObject').returns(expectedPopulatedRoom);

      const response = await roomRepository.createRoom(creationArgs);

      expect(Room.prototype.save.called).to.be.true;
      expect(Room.populate.calledWith(expectedRoom, { path: 'authors.author' }));
      expect(Room.prototype.toObject.called).to.be.true;

      expect(response).to.deep.equals(expectedPopulatedRoom);

      Room.prototype.save.restore();
      Room.populate.restore();
      Room.prototype.toObject.restore();
    });

    it('should create and return Room without authors', async () => {
      const creationArgs = {
        name: 'test_room',
      };
      const expectedRoom = {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        name: creationArgs.name,
        authors: [],
        isArchived: false,
      };

      sinon.stub(Room.prototype, 'save').returns(expectedRoom);
      sinon.stub(Room, 'populate').returns(Room.prototype);
      sinon.stub(Room.prototype, 'toObject').returns(expectedRoom);

      const response = await roomRepository.createRoom(creationArgs);

      expect(Room.prototype.save.called).to.be.true;
      expect(Room.populate.calledWith(expectedRoom, { path: 'authors.author' }));
      expect(Room.prototype.toObject.called).to.be.true;

      expect(response).to.deep.equals(expectedRoom);

      Room.prototype.save.restore();
      Room.populate.restore();
      Room.prototype.toObject.restore();
    });
  });

  describe('getAllRooms', () => {
    const expectedRooms = [
      {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        name: 'test_room',
        authors: [
          {
            author: {
              _id: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
              firstName: 'Tod',
              lastName: 'White',
              isArchived: false,
            },
            isActive: true,
          },
          {
            author: {
              _id: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
              firstName: 'Rob',
              lastName: 'Johnson',
              isArchived: false,
            },
            isActive: true,
          },
        ],
        isArchived: false,
      },
      {
        _id: '82f7e891-3879-4c50-ac74-63522553a711',
        name: 'test_room2',
        authors: [
          {
            author: {
              _id: '8b4da579-d94a-4215-a99d-a6e1e2267407',
              firstName: 'Sam',
              lastName: 'Smith',
              isArchived: false,
            },
            isActive: true,
          },
          {
            author: {
              _id: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
              firstName: 'John',
              lastName: 'Doe',
              isArchived: false,
            },
            isActive: true,
          },
        ],
        isArchived: true,
      },
    ];
    const expectedMessage = [
      {
        _id: 'ae944356-241f-44b1-a385-2251da7eef8a',
        roomId: '81f24773-2df3-4d37-b61a-c526328be6f3',
        authorId: '07b7a7f5-5611-4117-a360-3db5f0c0f2f5',
        text: 'test_text',
        isArchived: false,
      },
    ];
    const expectedFormattedRooms = [
      {
        ...expectedRooms[0],
        authors: [
          {
            ...expectedRooms[0].authors[0].author,
            isActive: expectedRooms[0].authors[0].isActive,
          },
          {
            ...expectedRooms[0].authors[1].author,
            isActive: expectedRooms[0].authors[1].isActive,
          },
        ],
      },
      {
        ...expectedRooms[1],
        authors: [
          {
            ...expectedRooms[1].authors[0].author,
            isActive: expectedRooms[0].authors[0].isActive,
          },
          {
            ...expectedRooms[1].authors[1].author,
            isActive: expectedRooms[1].authors[1].isActive,
          },
        ],
      },
    ];
    const expectedRoomsWithoutMessages = [
      {
        ...expectedFormattedRooms[0],
        mostRecentMessage: {},
      },
      {
        ...expectedFormattedRooms[1],
        mostRecentMessage: {},
      },
    ];
    const expectedRoomsWithMessages = [
      {
        ...expectedFormattedRooms[0],
        mostRecentMessage: expectedMessage,
      },
      {
        ...expectedFormattedRooms[1],
        mostRecentMessage: expectedMessage,
      },
    ];

    let roomQuery;
    let messageQuery;

    beforeEach(() => {
      const baseQuery = {
        where: sinon.stub().returnsThis(),
        elemMatch: sinon.stub().returnsThis(),
        equals: sinon.stub().returnsThis(),
        lt: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        populate: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
      };
      roomQuery = {
        ...baseQuery,
        exec: sinon.stub().returns(expectedRooms),
      };
      messageQuery = {
        ...baseQuery,
        exec: sinon.stub().returns(expectedMessage),
      };
      sinon.stub(Room, 'find').returns(roomQuery);
      sinon.stub(Message, 'findOne').returns(messageQuery);
    });

    afterEach(() => {
      Room.find.restore();
      Message.findOne.restore();
    });

    it('should get and return list of Rooms with default query params', async () => {
      const defaultQueryParams = {
        authorId: '',
        onlyActive: 1,
        includeArchived: 0,
        updatedBefore: MAX_TIMESTAMP,
        limit: 10,
      };
      let response = await roomRepository.getAllRooms({});

      expect(Room.find.called).to.be.true;
      expect(roomQuery.where.calledWith('authors')).to.be.false;
      expect(
        roomQuery.elemMatch.calledWithMatch({
          author: defaultQueryParams.authorId,
          isActive: true,
        }),
      ).to.be.false;
      expect(roomQuery.elemMatch.calledWithMatch({ author: defaultQueryParams.authorId })).to.be
        .false;
      expect(roomQuery.where.calledWith('isArchived')).to.be.true;
      expect(roomQuery.equals.calledWith(false)).to.be.true;
      expect(roomQuery.where.calledWith('updatedAt')).to.be.true;
      expect(
        roomQuery.lt.calledWith(
          sinon.match
            .instanceOf(Date)
            .and(sinon.match((value) => value.valueOf() === defaultQueryParams.updatedBefore)),
        ),
      ).to.be.true;
      expect(roomQuery.sort.calledWith('-updatedAt')).to.be.true;
      expect(roomQuery.limit.calledWith(defaultQueryParams.limit)).to.be.true;
      expect(roomQuery.populate.calledWith('authors.author')).to.be.true;
      expect(roomQuery.lean.called).to.be.true;
      expect(roomQuery.exec.called).to.be.true;

      expect(Message.findOne.called).to.be.true;
      expect(messageQuery.where.calledWith('roomId')).to.be.true;
      expect(messageQuery.equals.calledWith(expectedRooms[0]._id)).to.be.true;
      expect(messageQuery.equals.calledWith(expectedRooms[1]._id)).to.be.true;
      expect(messageQuery.where.calledWith('isArchived')).to.be.true;
      expect(messageQuery.equals.calledWith(false)).to.be.true;
      expect(messageQuery.sort.calledWith('-createdAt')).to.be.true;
      expect(messageQuery.lean.called).to.be.true;
      expect(messageQuery.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedRoomsWithMessages);

      messageQuery.exec.returns(null);

      response = await roomRepository.getAllRooms({});

      expect(response).to.deep.equals(expectedRoomsWithoutMessages);
    });

    it('should get and return list of Rooms with custom query params', async () => {
      let expectedQueryParams = {
        authorId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        onlyActive: 0,
        includeArchived: 1,
        updatedBefore: Date.UTC(2021),
        limit: 5,
      };

      await roomRepository.getAllRooms(expectedQueryParams);

      expect(roomQuery.elemMatch.calledWithMatch({ author: expectedQueryParams.authorId })).to.be
        .true;
      expect(
        roomQuery.lt.calledWith(
          sinon.match
            .instanceOf(Date)
            .and(sinon.match((value) => value.valueOf() === expectedQueryParams.updatedBefore)),
        ),
      ).to.be.true;
      expect(roomQuery.limit.calledWith(expectedQueryParams.limit)).to.be.true;

      expectedQueryParams = {
        authorId: '1906c857-293f-45ce-b1d3-1fc50fe2ce28',
        onlyActive: 1,
        includeArchived: 1,
        updatedBefore: Date.UTC(2021),
        limit: 5,
      };

      await roomRepository.getAllRooms(expectedQueryParams);

      expect(
        roomQuery.elemMatch.calledWithMatch({
          author: expectedQueryParams.authorId,
          isActive: true,
        }),
      ).to.be.true;
    });
  });

  describe('getRoomById', () => {
    const roomId = '81f24773-2df3-4d37-b61a-c526328be6f3';

    let query;

    beforeEach(() => {
      query = {
        populate: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
      };

      sinon.stub(Room, 'findById').returns(query);
    });

    afterEach(() => {
      Room.findById.restore();
    });

    it('should get and return Room with given id', async () => {
      const expectedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [
          {
            author: {
              _id: '8b4da579-d94a-4215-a99d-a6e1e2267407',
              firstName: 'Sam',
              lastName: 'Smith',
              isArchived: false,
            },
            isActive: true,
          },
          {
            author: {
              _id: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
              firstName: 'John',
              lastName: 'Doe',
              isArchived: false,
            },
            isActive: true,
          },
        ],
        isArchived: true,
      };
      const expectedFormattedRoom = {
        ...expectedRoom,
        authors: [
          {
            ...expectedRoom.authors[0].author,
            isActive: expectedRoom.authors[0].isActive,
          },
          {
            ...expectedRoom.authors[1].author,
            isActive: expectedRoom.authors[1].isActive,
          },
        ],
      };

      query.exec = sinon.stub().returns(expectedRoom);

      const response = await roomRepository.getRoomById(roomId);

      expect(Room.findById.calledWith(expectedRoom._id)).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedFormattedRoom);
    });

    it('should return null when Room with given id does not exist', async () => {
      query.exec = sinon.stub().returns(null);

      const response = await roomRepository.getRoomById(roomId);

      expect(Room.findById.calledWith(roomId)).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.be.null;
    });
  });

  describe('updateRoomById', () => {
    const roomId = '81f24773-2df3-4d37-b61a-c526328be6f3';
    const updateArgs = {
      name: 'test_room',
      authors: [
        { author: '8b4da579-d94a-4215-a99d-a6e1e2267407', isActive: true },
        { author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3', isActive: true },
      ],
    };
    const expectedRoom = {
      _id: roomId,
      name: updateArgs.name,
      authors: [
        {
          author: {
            _id: updateArgs.authors[0].author,
            firstName: 'Sam',
            lastName: 'Smith',
            isArchived: false,
          },
          isActive: updateArgs.authors[0].isActive,
        },
        {
          author: {
            _id: updateArgs.authors[1].author,
            firstName: 'John',
            lastName: 'Doe',
            isArchived: false,
          },
          isActive: updateArgs.authors[0].isActive,
        },
      ],
      isArchived: true,
    };
    const expectedFormattedRoom = {
      ...expectedRoom,
      authors: [
        {
          ...expectedRoom.authors[0].author,
          isActive: expectedRoom.authors[0].isActive,
        },
        {
          ...expectedRoom.authors[1].author,
          isActive: expectedRoom.authors[1].isActive,
        },
      ],
    };

    let query;

    beforeEach(() => {
      query = {
        populate: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedRoom),
      };

      sinon.stub(Room, 'findByIdAndUpdate').returns(query);
    });

    afterEach(() => {
      Room.findByIdAndUpdate.restore();
    });

    it('should update and return Room with given id and default params', async () => {
      const response = await roomRepository.updateRoomById(roomId, {});

      expect(
        Room.findByIdAndUpdate.calledWithMatch(
          expectedRoom._id,
          { name: '', authors: [] },
          { new: true, runValidators: true },
        ),
      ).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedFormattedRoom);
    });

    it('should update and return Room with given id and custom params', async () => {
      const response = await roomRepository.updateRoomById(roomId, expectedRoom);

      expect(
        Room.findByIdAndUpdate.calledWithMatch(expectedRoom._id, updateArgs, {
          new: true,
          runValidators: true,
        }),
      ).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedFormattedRoom);
    });

    it('should return null when Room with given id does not exist', async () => {
      query.exec.returns(null);

      const response = await roomRepository.updateRoomById(roomId, {});

      expect(
        Room.findByIdAndUpdate.calledWithMatch(
          expectedRoom._id,
          { name: '', authors: [] },
          {
            new: true,
            runValidators: true,
          },
        ),
      ).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(null);
    });
  });

  describe('archiveRoomById', () => {
    const roomId = '81f24773-2df3-4d37-b61a-c526328be6f3';
    const expectedRoom = {
      _id: roomId,
      name: 'test_room',
      authors: [
        {
          author: {
            _id: '8b4da579-d94a-4215-a99d-a6e1e2267407',
            firstName: 'Sam',
            lastName: 'Smith',
            isArchived: false,
          },
          isActive: true,
        },
        {
          author: {
            _id: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            firstName: 'John',
            lastName: 'Doe',
            isArchived: false,
          },
          isActive: true,
        },
      ],
      isArchived: true,
    };
    const expectedFormattedRoom = {
      ...expectedRoom,
      authors: [
        {
          ...expectedRoom.authors[0].author,
          isActive: expectedRoom.authors[0].isActive,
        },
        {
          ...expectedRoom.authors[1].author,
          isActive: expectedRoom.authors[1].isActive,
        },
      ],
    };

    let query;

    beforeEach(() => {
      query = {
        populate: sinon.stub().returnsThis(),
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedRoom),
      };
      sinon.stub(Room, 'findByIdAndUpdate').returns(query);
    });

    afterEach(() => {
      Room.findByIdAndUpdate.restore();
    });

    it('should archive and return Room with given id', async () => {
      const response = await roomRepository.archiveRoomById(roomId);

      expect(
        Room.findByIdAndUpdate.calledWithMatch(
          expectedRoom._id,
          { isArchived: true },
          {
            new: true,
            runValidators: true,
          },
        ),
      ).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedFormattedRoom);
    });

    it('should return null when Room with given id does not exist', async () => {
      query.exec.returns(null);

      const response = await roomRepository.archiveRoomById(roomId);

      expect(
        Room.findByIdAndUpdate.calledWithMatch(
          expectedRoom._id,
          { isArchived: true },
          {
            new: true,
            runValidators: true,
          },
        ),
      ).to.be.true;
      expect(query.populate.calledWith('authors.author')).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(null);
    });
  });

  describe('deleteRoomById', () => {
    it('should delete and return the Room', async () => {
      const roomId = '81f24773-2df3-4d37-b61a-c526328be6f3';
      const expectedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [
          {
            author: '8b4da579-d94a-4215-a99d-a6e1e2267407',
            isActive: true,
          },
          {
            author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            isActive: true,
          },
        ],
        isArchived: true,
      };

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedRoom),
      };

      sinon.stub(Room, 'findByIdAndDelete').returns(query);

      const response = await roomRepository.deleteRoomById(roomId);

      expect(Room.findByIdAndDelete.calledWith(expectedRoom._id)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.deep.equals(expectedRoom);

      Room.findByIdAndDelete.restore();
    });

    it('should return null if the Room does not exist', async () => {
      const invalidId = '81f24773-2df3-4d37-b61a-c526328be6f3';

      const query = {
        lean: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(null),
      };

      sinon.stub(Room, 'findByIdAndDelete').returns(query);

      const response = await roomRepository.deleteRoomById(invalidId);

      expect(Room.findByIdAndDelete.calledWith(invalidId)).to.be.true;
      expect(query.lean.called).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(response).to.be.null;

      Room.findByIdAndDelete.restore();
    });
  });

  describe('archiveAllRooms', () => {
    const authorId = '8b4da579-d94a-4215-a99d-a6e1e2267407';
    const expectedRooms = [
      {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        name: 'test_room',
        authors: [
          {
            author: authorId,
            isActive: true,
          },
          {
            author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            isActive: true,
          },
        ],
        isArchived: true,
      },
      {
        _id: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
        name: 'test_room2',
        authors: [
          {
            author: authorId,
            isActive: true,
          },
          {
            author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            isActive: true,
          },
        ],
        isArchived: true,
      },
    ];

    let query;

    beforeEach(() => {
      expectedRooms[0].updateOne = sinon.stub();
      expectedRooms[1].updateOne = sinon.stub();
      query = {
        where: sinon.stub().returnsThis(),
        elemMatch: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedRooms),
      };
      sinon.stub(Room, 'find').returns(query);
    });

    afterEach(() => {
      Room.find.restore();
    });

    it('should archive all Rooms with default attributes', async () => {
      const defaultQueryParams = {
        authorId: '',
      };
      const response = await roomRepository.archiveAllRooms({});

      expect(Room.find.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('authors')).to.be.false;
      expect(
        query.elemMatch.calledWithMatch({ author: defaultQueryParams.authorId, isActive: true }),
      ).to.be.false;
      expect(query.exec.called).to.be.true;

      expect(
        expectedRooms[0].updateOne.calledWith({
          authors: expectedRooms[0].authors,
          isArchived: false,
        }),
      );
      expect(
        expectedRooms[1].updateOne.calledWith({
          authors: expectedRooms[1].authors,
          isArchived: false,
        }),
      );

      expect(response).to.equals(true);
    });

    it('should archive all Rooms with custom attributes', async () => {
      const expectedQueryParams = { authorId };
      const response = await roomRepository.archiveAllRooms(expectedQueryParams);

      expect(Room.find.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('authors')).to.be.true;
      expect(
        query.elemMatch.calledWithMatch({ author: expectedQueryParams.authorId, isActive: true }),
      ).to.be.true;
      expect(query.exec.called).to.be.true;

      expect(
        expectedRooms[0].updateOne.calledWithMatch({
          authors: expectedRooms[0].authors,
          isArchived: false,
        }),
      );
      expect(
        expectedRooms[1].updateOne.calledWithMatch({
          authors: expectedRooms[1].authors,
          isArchived: false,
        }),
      );

      expect(response).to.equals(true);

      const expectedArchivedRooms = [
        {
          ...expectedRooms[0],
          authors: [
            {
              ...expectedRooms[0].authors[0],
            },
            {
              ...expectedRooms[0].authors[1],
              isActive: false,
            },
          ],
        },
        {
          ...expectedRooms[1],
          authors: [
            {
              ...expectedRooms[1].authors[0],
            },
            {
              ...expectedRooms[1].authors[1],
              isActive: false,
            },
          ],
        },
      ];

      query.exec.returns(expectedArchivedRooms);

      await roomRepository.archiveAllRooms(expectedQueryParams);

      expect(
        expectedArchivedRooms[0].updateOne.calledWithMatch({
          authors: expectedArchivedRooms[0].authors,
          isArchived: true,
        }),
      );
      expect(
        expectedArchivedRooms[1].updateOne.calledWithMatch({
          authors: expectedArchivedRooms[1].authors,
          isArchived: true,
        }),
      );
    });
  });

  describe('deleteAllRooms', () => {
    const authorId = '8b4da579-d94a-4215-a99d-a6e1e2267407';
    const expectedRooms = [
      {
        _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
        name: 'test_room',
        authors: [
          {
            author: authorId,
            isActive: true,
          },
          {
            author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            isActive: true,
          },
        ],
        isArchived: true,
      },
      {
        _id: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
        name: 'test_room2',
        authors: [
          {
            author: authorId,
            isActive: true,
          },
          {
            author: 'e3ba37a9-ef62-4572-be4f-a3869d6fafc3',
            isActive: true,
          },
        ],
        isArchived: true,
      },
    ];

    let query;

    beforeEach(() => {
      expectedRooms[0].updateOne = sinon.stub();
      expectedRooms[0].deleteOne = sinon.stub();
      expectedRooms[1].updateOne = sinon.stub();
      expectedRooms[1].deleteOne = sinon.stub();
      query = {
        where: sinon.stub().returnsThis(),
        elemMatch: sinon.stub().returnsThis(),
        exec: sinon.stub().returns(expectedRooms),
      };
      sinon.stub(Room, 'find').returns(query);
    });

    afterEach(() => {
      Room.find.restore();
    });

    it('should delete all Rooms with default attributes', async () => {
      const defaultQueryParams = {
        authorId: '',
      };
      const response = await roomRepository.deleteAllRooms({});

      expect(Room.find.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('authors')).to.be.false;
      expect(query.elemMatch.calledWithMatch({ author: defaultQueryParams.authorId })).to.be.false;
      expect(query.exec.called).to.be.true;

      const expectedAuthors1 = [...expectedRooms[0].authors];
      delete expectedAuthors1[0];
      expect(
        expectedRooms[0].updateOne.calledWith({
          authors: expectedAuthors1,
        }),
      );

      const expectedAuthors2 = [...expectedRooms[1].authors];
      delete expectedAuthors1[0];
      expect(
        expectedRooms[1].updateOne.calledWith({
          authors: expectedAuthors2,
        }),
      );

      expect(response).to.equals(true);
    });

    it('should delete all Rooms with custom attributes', async () => {
      const expectedQueryParams = { authorId };
      const response = await roomRepository.deleteAllRooms(expectedQueryParams);

      expect(Room.find.calledWithMatch({})).to.be.true;
      expect(query.where.calledWith('authors')).to.be.true;
      expect(query.elemMatch.calledWithMatch({ author: expectedQueryParams.authorId })).to.be.true;
      expect(query.exec.called).to.be.true;

      const expectedAuthors1 = [...expectedRooms[0].authors];
      delete expectedAuthors1[0];
      expect(
        expectedRooms[0].updateOne.calledWith({
          authors: expectedAuthors1,
        }),
      );

      const expectedAuthors2 = [...expectedRooms[1].authors];
      delete expectedAuthors1[0];
      expect(
        expectedRooms[1].updateOne.calledWith({
          authors: expectedAuthors2,
        }),
      );

      expect(response).to.equals(true);

      const expectedDeletedRooms = [
        {
          ...expectedRooms[0],
          authors: [
            {
              ...expectedRooms[0].authors[0],
            },
            {
              ...expectedRooms[0].authors[1],
              isActive: false,
            },
          ],
        },
        {
          ...expectedRooms[1],
          authors: [
            {
              ...expectedRooms[1].authors[0],
            },
            {
              ...expectedRooms[1].authors[1],
              isActive: false,
            },
          ],
        },
      ];

      query.exec.returns(expectedDeletedRooms);

      await roomRepository.deleteAllRooms(expectedQueryParams);

      expect(expectedDeletedRooms[0].deleteOne.called).to.be.true;
      expect(expectedDeletedRooms[1].deleteOne.called).to.be.true;
    });
  });
});
