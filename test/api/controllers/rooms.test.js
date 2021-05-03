const sinon = require('sinon');
const { expect } = require('chai');

const ApplicationError = require('../../../src/util/ApplicationError');
const roomController = require('../../../src/api/controllers/rooms');
const roomRepository = require('../../../src/data/repositories/room');
const messageRepository = require('../../../src/data/repositories/message');

describe('Room Controller', () => {
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

  describe('createRoom', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'createRoom');
    });

    afterEach(() => {
      roomRepository.createRoom.restore();
    });

    it('should return created Room', async () => {
      const baseUrl = '/test/url';
      const body = {
        name: 'test_room',
        authors: [
          { _id: 'cf328a1c-6964-43e9-9200-46596e690584' },
          { _id: '868554b9-ed3a-45ad-88fd-86319bf2b45b' },
        ],
      };
      const creationArgs = {
        name: body.name,
        authors: body.authors,
      };
      const createdRoom = {
        _id: '6b62ac28-39e9-4201-885f-1adc1e90c1e8',
        name: creationArgs.name,
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '868554b9-ed3a-45ad-88fd-86319bf2b45b', isActive: true },
        ],
        isArchived: false,
      };

      const expectedStatus = 201;
      const expectedLocation = `${baseUrl}/${createdRoom._id}`;
      const expectedJson = { room: createdRoom };

      roomRepository.createRoom.returns(createdRoom);

      routeParams.req = { ...routeParams.req, body, baseUrl };
      routeParams.res = { ...routeParams.res, location: sinon.stub() };

      await roomController.createRoom(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.createRoom.calledWithMatch(creationArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(res.location.calledWith(expectedLocation)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const body = {
        name: 'test_room',
        authors: [
          { _id: 'cf328a1c-6964-43e9-9200-46596e690584' },
          { _id: '868554b9-ed3a-45ad-88fd-86319bf2b45b' },
        ],
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.createRoom.throws(expectedError);

      routeParams.req = { ...routeParams.req, body };

      await roomController.createRoom(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getAllRooms', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'getAllRooms');
    });

    afterEach(() => {
      roomRepository.getAllRooms.restore();
    });

    it('should return list of Rooms', async () => {
      const query = {
        authorId: '868554b9-ed3a-45ad-88fd-86319bf2b45b',
        onlyActive: true,
        includeArchived: true,
        updatedBefore: Date.UTC(2021),
        limit: 10,
      };
      const fetchArgs = {
        authorId: query.authorId,
        onlyActive: query.onlyActive,
        includeArchived: query.includeArchived,
        updatedBefore: query.updatedBefore,
        limit: query.limit,
      };
      const fetchedRooms = [
        {
          _id: '81f24773-2df3-4d37-b61a-c526328be6f3',
          name: 'test_room',
          authors: [
            { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
            { author: fetchArgs.authorId, isActive: true },
          ],
          isArchived: false,
        },
        {
          id: '54350cdd-ea19-458d-9d7c-8f10b701cfda',
          name: 'test_room',
          authors: [
            { author: fetchArgs.authorId, isActive: true },
            { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
          ],
          isArchived: false,
        },
      ];

      const expectedStatus = 200;
      const expectedJson = { rooms: fetchedRooms };

      roomRepository.getAllRooms.returns(fetchedRooms);

      routeParams.req = { ...routeParams.req, query };

      await roomController.getAllRooms(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.getAllRooms.calledWithMatch(fetchArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next if error thrown', async () => {
      const query = {
        authorId: '868554b9-ed3a-45ad-88fd-86319bf2b45b',
        onlyActive: true,
        includeArchived: true,
        updatedBefore: Date.UTC(2021),
        limit: 10,
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.getAllRooms.throws(expectedError);

      routeParams.req = { ...routeParams.req, query };

      await roomController.getAllRooms(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('getRoomById', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'getRoomById');
    });

    afterEach(() => {
      roomRepository.getRoomById.restore();
    });

    it('should return requested Room', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { roomId } = params;
      const fetchedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { room: fetchedRoom };

      roomRepository.getRoomById.returns(fetchedRoom);

      routeParams.req = { ...routeParams.req, params };

      await roomController.getRoomById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.getRoomById.calledWith(roomId)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Room not found', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      roomRepository.getRoomById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await roomController.getRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Room not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.getRoomById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await roomController.getRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('updateRoomById', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'updateRoomById');
    });

    afterEach(() => {
      roomRepository.updateRoomById.restore();
    });

    it('should return updated Room', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        name: 'updated_test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
      };
      const { roomId } = params;
      const updateArgs = {
        name: body.name,
        authors: body.authors,
      };
      const updatedRoom = {
        _id: roomId,
        name: updateArgs.name,
        authors: updateArgs.authors,
        isArchived: false,
      };

      const expectedStatus = 200;
      const expectedJson = { room: updatedRoom };

      roomRepository.updateRoomById.returns(updatedRoom);

      routeParams.req = { ...routeParams.req, body, params };

      await roomController.updateRoomById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.updateRoomById.calledWithMatch(roomId, updateArgs)).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Room not found', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        name: 'updated_test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
      };

      roomRepository.updateRoomById.returns(null);

      routeParams.req = { ...routeParams.req, body, params };

      await roomController.updateRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Room not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const body = {
        name: 'updated_test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
      };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.updateRoomById.throws(expectedError);

      routeParams.req = { ...routeParams.req, body, params };

      await roomController.updateRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('archiveRoomById', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'archiveRoomById');
      sinon.stub(messageRepository, 'archiveAllMessages');
    });

    afterEach(() => {
      roomRepository.archiveRoomById.restore();
      messageRepository.archiveAllMessages.restore();
    });

    it('should return archived Room', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { roomId } = params;
      const archivedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { room: archivedRoom };

      roomRepository.archiveRoomById.returns(archivedRoom);

      routeParams.req = { ...routeParams.req, params };

      await roomController.archiveRoomById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.archiveRoomById.calledWith(roomId)).to.be.true;
      expect(messageRepository.archiveAllMessages.calledWithMatch({ roomId })).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Room not found', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      roomRepository.archiveRoomById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await roomController.archiveRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Room not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.archiveRoomById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await roomController.archiveRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });

  describe('deleteRoomById', () => {
    beforeEach(() => {
      sinon.stub(roomRepository, 'deleteRoomById');
      sinon.stub(messageRepository, 'deleteAllMessages');
    });

    afterEach(() => {
      roomRepository.deleteRoomById.restore();
      messageRepository.deleteAllMessages.restore();
    });

    it('should return deleted Room id', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };
      const { roomId } = params;
      const deletedRoom = {
        _id: roomId,
        name: 'test_room',
        authors: [
          { author: 'cf328a1c-6964-43e9-9200-46596e690584', isActive: true },
          { author: '5c3bf4e5-b811-497e-a1ff-cc9bd3936b51', isActive: true },
        ],
        isArchived: true,
      };

      const expectedStatus = 200;
      const expectedJson = { room: deletedRoom };

      roomRepository.deleteRoomById.returns(deletedRoom);

      routeParams.req = { ...routeParams.req, params };

      await roomController.deleteRoomById(...Object.values(routeParams));

      const { res, next } = routeParams;

      expect(roomRepository.deleteRoomById.calledWith(roomId)).to.be.true;
      expect(messageRepository.deleteAllMessages.calledWithMatch({ roomId })).to.be.true;
      expect(res.json.calledWithMatch(expectedJson)).to.be.true;
      expect(res.status.calledWith(expectedStatus)).to.be.true;
      expect(next.called).to.be.false;
    });

    it('should call next with ApplicationError if Room not found', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      roomRepository.deleteRoomById.returns(null);

      routeParams.req = { ...routeParams.req, params };

      await roomController.deleteRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(
        next.calledWith(
          sinon.match
            .instanceOf(ApplicationError)
            .and(sinon.match.has('message', 'Room not found.'))
            .and(sinon.match.has('statusCode', 404)),
        ),
      ).to.be.true;
    });

    it('should call next if error thrown', async () => {
      const params = { roomId: '9b6117ae-9fd6-4b33-ac3e-40a80aa0e032' };

      const expectedError = new Error();
      expectedError.name = 'repo_error';

      roomRepository.deleteRoomById.throws(expectedError);

      routeParams.req = { ...routeParams.req, params };

      await roomController.deleteRoomById(...Object.values(routeParams));

      const { next } = routeParams;

      expect(next.calledWithMatch(expectedError)).to.be.true;
    });
  });
});
