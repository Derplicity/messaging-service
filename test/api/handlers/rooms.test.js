const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const errorUtils = require('../../../src/util/errorUtils');
const roomHandler = require('../../../src/api/handlers/rooms');
const messageRepository = require('../../../src/data/repositories/message');
const roomRepository = require('../../../src/data/repositories/room');

describe('Room Handler', () => {
  let socket;

  beforeEach(() => {
    socket = {
      join: sinon.stub(),
      leave: sinon.stub(),
      to: sinon.stub().returnsThis(),
      emit: sinon.stub(),
    };
    sinon.stub(errorUtils, 'format');
  });

  afterEach(() => {
    errorUtils.format.restore();
  });

  describe('createRoom', () => {
    let fakeCreateRoom;

    beforeEach(() => {
      fakeCreateRoom = roomHandler.createRoom.bind(socket);
      sinon.stub(roomRepository, 'createRoom');
    });

    afterEach(() => {
      roomRepository.createRoom.restore();
    });

    it('should create, emit and return new Room', async () => {
      const cb = sinon.stub();
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7' };
      const creationArgs = {
        name: 'test_room',
        authors: [author1],
      };
      const reqArgs = [
        {
          name: creationArgs.name,
          authors: creationArgs.authors,
        },
        cb,
      ];
      const populatedAuthor1 = {
        ...author1,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
        isActive: true,
      };
      const createdRoom = {
        _id: 'd8379fc1-26d1-421f-a9db-cdecf51974fb',
        name: creationArgs.name,
        authors: [populatedAuthor1],
        isArchived: false,
      };

      const expectedType = 'ROOM_CREATED';
      const expectedRes = { room: createdRoom };

      roomRepository.createRoom.returns(createdRoom);

      await fakeCreateRoom(...reqArgs);

      expect(roomRepository.createRoom.calledWithMatch(creationArgs)).to.be.true;
      expect(socket.to.calledWithMatch(author1._id)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return error if error thrown', async () => {
      const cb = sinon.stub();
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7' };
      const creationArgs = {
        name: 'test_room',
        authors: [author1],
      };
      const reqArgs = [
        {
          name: creationArgs.name,
          authors: creationArgs.authors,
        },
        cb,
      ];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.createRoom.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeCreateRoom(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('joinRoom', () => {
    it('should join and return room', () => {
      const fakeJoinRoom = roomHandler.joinRoom.bind(socket);
      const room = 'test_room';

      const expectedType = 'ROOM_JOINED';
      const expectedRes = room;

      fakeJoinRoom(room);

      expect(socket.join.calledWith(room)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes));
    });
  });

  describe('joinRooms', () => {
    it('should join and return rooms', () => {
      const fakeJoinRooms = roomHandler.joinRooms.bind(socket);
      const rooms = ['test_room1', 'test_room2'];

      const expectedType = 'ROOMS_JOINED';
      const expectedRes = rooms;

      fakeJoinRooms(rooms);

      expect(socket.join.calledWithMatch(rooms[0])).to.be.true;
      expect(socket.join.calledWithMatch(rooms[1])).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes));
    });
  });

  describe('leaveRoom', () => {
    it('should leave and return room', () => {
      const fakeLeaveRoom = roomHandler.leaveRoom.bind(socket);
      const room = 'test_room';

      const expectedType = 'ROOM_LEFT';
      const expectedRes = room;

      fakeLeaveRoom(room);

      expect(socket.leave.calledWith(room)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes));
    });
  });

  describe('leaveRooms', () => {
    it('should leave and return rooms', () => {
      const fakeLeaveRooms = roomHandler.leaveRooms.bind(socket);
      const rooms = ['test_room1', 'test_room2'];

      const expectedType = 'ROOMS_LEFT';
      const expectedRes = rooms;

      fakeLeaveRooms(rooms);

      expect(socket.leave.calledWithMatch(rooms[0])).to.be.true;
      expect(socket.leave.calledWithMatch(rooms[1])).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes));
    });
  });

  describe('updateRoomById', () => {
    let fakeUpdateRoomById;

    beforeEach(() => {
      fakeUpdateRoomById = roomHandler.updateRoomById.bind(socket);
      sinon.stub(roomRepository, 'updateRoomById');
    });

    afterEach(() => {
      roomRepository.updateRoomById.restore();
    });

    it('should emit and return updated Room', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7' };
      const updateArgs = {
        name: 'test_room',
        authors: [author1],
      };
      const reqArgs = [
        {
          id: roomId,
          updateValues: {
            name: updateArgs.name,
            authors: updateArgs.authors,
          },
        },
        cb,
      ];
      const populatedAuthor1 = {
        ...author1,
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
        isActive: true,
      };
      const updatedRoom = {
        _id: roomId,
        name: updateArgs.name,
        authors: [populatedAuthor1],
        isArchived: false,
      };

      const expectedType = 'ROOM_UPDATED';
      const expectedRes = { room: updatedRoom };

      roomRepository.updateRoomById.returns(updatedRoom);

      await fakeUpdateRoomById(...reqArgs);

      expect(roomRepository.updateRoomById.calledWithMatch(roomId, updateArgs)).to.be.true;
      expect(socket.to.calledWithMatch(roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Room not found', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7' };
      const updateArgs = {
        name: 'test_room',
        authors: [author1],
      };
      const reqArgs = [
        {
          id: roomId,
          updateValues: {
            name: updateArgs.name,
            authors: updateArgs.authors,
          },
        },
        cb,
      ];

      const expectedError = { message: 'Room not found.' };

      roomRepository.updateRoomById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeUpdateRoomById(...reqArgs);

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
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const author1 = { _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7' };
      const updateArgs = {
        name: 'test_room',
        authors: [author1],
      };
      const reqArgs = [
        {
          id: roomId,
          updateValues: {
            name: updateArgs.name,
            authors: updateArgs.authors,
          },
        },
        cb,
      ];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.updateRoomById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeUpdateRoomById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('archiveRoomById', () => {
    let fakeArchiveRoomById;

    beforeEach(() => {
      fakeArchiveRoomById = roomHandler.archiveRoomById.bind(socket);
      sinon.stub(roomRepository, 'archiveRoomById');
      sinon.stub(messageRepository, 'archiveAllMessages');
    });

    afterEach(() => {
      roomRepository.archiveRoomById.restore();
      messageRepository.archiveAllMessages.restore();
    });

    it('should emit and return archived Room', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];
      const author1 = {
        _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7',
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
        isActive: true,
      };
      const archivedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [author1],
        isArchived: true,
      };

      const expectedType = 'ROOM_ARCHIVED';
      const expectedRes = { room: archivedRoom };

      roomRepository.archiveRoomById.returns(archivedRoom);

      await fakeArchiveRoomById(...reqArgs);

      expect(roomRepository.archiveRoomById.calledWith(roomId)).to.be.true;
      expect(messageRepository.archiveAllMessages.calledWithMatch({ roomId })).to.be.true;
      expect(socket.to.calledWithMatch(roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Room not found', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];

      const expectedError = { message: 'Room not found.' };

      roomRepository.archiveRoomById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeArchiveRoomById(...reqArgs);

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
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.archiveRoomById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeArchiveRoomById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });

  describe('deleteRoomById', () => {
    let fakeDeleteRoomById;

    beforeEach(() => {
      fakeDeleteRoomById = roomHandler.deleteRoomById.bind(socket);
      sinon.stub(roomRepository, 'deleteRoomById');
      sinon.stub(messageRepository, 'deleteAllMessages');
    });

    afterEach(() => {
      roomRepository.deleteRoomById.restore();
      messageRepository.deleteAllMessages.restore();
    });

    it('should emit and return deleted Room', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];
      const author1 = {
        _id: '551217ca-5457-4fba-88c9-6e920ec2c3a7',
        firstName: 'John',
        lastName: 'Doe',
        isArchived: false,
        isActive: true,
      };
      const deletedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [author1],
        isArchived: true,
      };

      const expectedType = 'ROOM_DELETED';
      const expectedRes = { room: deletedRoom };

      roomRepository.deleteRoomById.returns(deletedRoom);

      await fakeDeleteRoomById(...reqArgs);

      expect(roomRepository.deleteRoomById.calledWith(roomId)).to.be.true;
      expect(messageRepository.deleteAllMessages.calledWithMatch({ roomId })).to.be.true;
      expect(socket.to.calledWithMatch(roomId)).to.be.true;
      expect(socket.emit.calledWithMatch(expectedType, expectedRes)).to.be.true;
      expect(cb.calledWithMatch(expectedRes)).to.be.true;
    });

    it('should return ApplicationError if Room not found', async () => {
      const cb = sinon.stub();
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];

      const expectedError = { message: 'Room not found.' };

      roomRepository.deleteRoomById.returns(null);
      errorUtils.format.returns(expectedError);

      await fakeDeleteRoomById(...reqArgs);

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
      const roomId = '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032';
      const reqArgs = [{ id: roomId }, cb];

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.deleteRoomById.throws(expectedError);
      errorUtils.format.returns(expectedError);

      await fakeDeleteRoomById(...reqArgs);

      expect(errorUtils.format.calledWithMatch(expectedError)).to.be.true;
      expect(cb.calledWithMatch({ error: expectedError })).to.be.true;
    });
  });
});
