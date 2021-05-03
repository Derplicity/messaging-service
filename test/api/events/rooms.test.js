const sinon = require('sinon');
const { expect } = require('chai');

const roomEvents = require('../../../src/api/events/rooms');
const roomHandler = require('../../../src/api/handlers/rooms');

describe('Room Events', () => {
  let socket;

  beforeEach(() => {
    socket = {
      on: sinon.stub(),
    };

    roomEvents(socket);
  });

  describe('CREATE_ROOM', () => {
    it('should call createRoom', () => {
      expect(socket.on.calledWithExactly('CREATE_ROOM', roomHandler.createRoom)).to.be.true;
    });
  });

  describe('JOIN_ROOM', () => {
    it('should call joinRoom', () => {
      expect(socket.on.calledWithExactly('JOIN_ROOM', roomHandler.joinRoom)).to.be.true;
    });
  });

  describe('JOIN_ROOMS', () => {
    it('should call joinRooms', () => {
      expect(socket.on.calledWithExactly('JOIN_ROOMS', roomHandler.joinRooms)).to.be.true;
    });
  });

  describe('LEAVE_ROOM', () => {
    it('should call leaveRoom', () => {
      expect(socket.on.calledWithExactly('LEAVE_ROOM', roomHandler.leaveRoom)).to.be.true;
    });
  });

  describe('LEAVE_ROOMS', () => {
    it('should call leaveRooms', () => {
      expect(socket.on.calledWithExactly('LEAVE_ROOMS', roomHandler.leaveRooms)).to.be.true;
    });
  });

  describe('UPDATE_ROOM', () => {
    it('should call updateRoomById', () => {
      expect(socket.on.calledWithExactly('UPDATE_ROOM', roomHandler.updateRoomById)).to.be.true;
    });
  });

  describe('ARCHIVE_ROOM', () => {
    it('should call archiveRoomById', () => {
      expect(socket.on.calledWithExactly('ARCHIVE_ROOM', roomHandler.archiveRoomById)).to.be.true;
    });
  });

  describe('DELETE_ROOM', () => {
    it('should call deleteRoomById', () => {
      expect(socket.on.calledWithExactly('DELETE_ROOM', roomHandler.deleteRoomById)).to.be.true;
    });
  });
});
