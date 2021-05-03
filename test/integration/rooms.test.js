const { expect } = require('chai');
const request = require('supertest');
const { createServer } = require('http');
const Client = require('socket.io-client');

const {
  JOIN_ROOM,
  UPDATE_ROOM,
  ROOM_UPDATED,
  ROOM_JOINED,
  ROOM_ARCHIVED,
  ARCHIVE_ROOM,
  ROOM_DELETED,
  DELETE_ROOM,
  ROOM_CREATED,
  CREATE_ROOM,
} = require('../../src/config/eventTypes');
const { clearDatabase } = require('../helpers');
const app = require('../../src/app');

const baseAuthorUrl = '/api/v1/authors';
const baseRoomUrl = '/api/v1/rooms';
const baseMessageUrl = '/api/v1/messages';

describe('Room Integrations', () => {
  let server;
  let localClientSocket;
  let remoteClientSocket;

  before((done) => {
    server = createServer(app);

    require('../../src/config/events')(server);

    server.listen(() => {
      const { port } = server.address();

      localClientSocket = new Client(`http://localhost:${port}`);

      localClientSocket.once('connect', () => {
        remoteClientSocket = new Client(`http://localhost:${port}`);

        remoteClientSocket.once('connect', done);
      });
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  after(() => {
    localClientSocket.close();
    remoteClientSocket.close();
    server.close();
  });

  describe('Create via http', () => {
    it('should create and return valid Room', async () => {
      const authorCreationArgs = {
        _id: '356c9120-9612-4c4e-92c7-d52efb7be695',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs = {
        name: 'test_room',
        authors: [author1],
      };

      const response = await request(app)
        .post(`${baseRoomUrl}/`)
        .send(roomCreationArgs)
        .expect(201);

      const { room } = response.body;
      expect(room._id).to.exist;
      expect(response.headers.location).to.equal(`${baseRoomUrl}/${room._id}`);
      expect(room.name).to.equal(roomCreationArgs.name);
      expect(room.authors.length).to.equal(1);
      expect(room.authors[0].isActive).to.be.true;
      delete room.authors[0].isActive;
      expect(room.authors[0]).to.deep.equals(author1);
      expect(room.isArchived).to.be.false;
      expect(room.createdAt).to.exist;
      expect(room.updatedAt).to.exist;
    });

    it('should throw and return validation error with invalid Room', async () => {
      const response = await request(app).post(`${baseRoomUrl}/`).send({}).expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid field.');
      expect(error.fields.name).to.equal('required');
    });
  });

  describe('Create via ws', () => {
    it('should create and return valid Room', (done) => {
      const authorCreationArgs = {
        _id: '356c9120-9612-4c4e-92c7-d52efb7be695',
        firstName: 'John',
        lastName: 'Doe',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs)
        .then((createAuthorResponse) => {
          const { author: author1 } = createAuthorResponse.body;

          remoteClientSocket.once(ROOM_JOINED, () => {
            const roomCreationArgs = {
              name: 'test_room',
              authors: [author1],
            };

            let numCalls = 0;
            const cb = (data) => {
              const { room, error } = data;
              expect(error).to.not.exist;
              expect(room._id).to.exist;
              expect(room.name).to.equal(roomCreationArgs.name);
              expect(room.authors.length).to.equal(1);
              expect(room.authors[0].isActive).to.be.true;
              delete room.authors[0].isActive;
              expect(room.authors[0]).to.deep.equals(author1);
              expect(room.isArchived).to.be.false;
              expect(room.createdAt).to.exist;
              expect(room.updatedAt).to.exist;

              // Called for both local and remote client
              if (numCalls === 1) {
                done();
              }

              numCalls += 1;
            };

            remoteClientSocket.once(ROOM_CREATED, cb);

            localClientSocket.emit(CREATE_ROOM, roomCreationArgs, cb);
          });

          remoteClientSocket.emit(JOIN_ROOM, author1._id);
        });
    });

    it('should throw and return validation error with invalid Room', async () => {
      const cb = (data) => {
        const { room, error } = data;
        expect(room).to.not.exist;
        expect(error.message).to.equal('Invalid field.');
        expect(error.fields.name).to.equal('required');
      };

      localClientSocket.emit(CREATE_ROOM, {}, cb);
    });
  });

  describe('Get All via http', () => {
    it('should return empty list', async () => {
      const response = await request(app).get(`${baseRoomUrl}/`).query({}).expect(200);

      const { rooms } = response.body;
      expect(rooms.length).to.equal(0);
    });

    it('should return list of Rooms', async () => {
      const authorCreationArgs = {
        _id: '5fe4e87d-a38c-4c74-82c8-2df87ee1349e',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs1 = {
        name: 'test_room1',
        authors: [author1],
      };
      const roomCreationArgs2 = {
        name: 'test_room2',
        authors: [author1],
      };

      const createRoomResponse1 = await request(app)
        .post(`${baseRoomUrl}/`)
        .send(roomCreationArgs1);
      const createRoomResponse2 = await request(app)
        .post(`${baseRoomUrl}/`)
        .send(roomCreationArgs2);

      const { room: room1 } = createRoomResponse1.body;
      const { room: room2 } = createRoomResponse2.body;

      const response = await request(app).get(`${baseRoomUrl}/`).query({}).expect(200);

      const { rooms } = response.body;
      expect(rooms.length).to.equal(2);
      expect(rooms[0].mostRecentMessage).to.exist;
      delete rooms[0].mostRecentMessage;
      expect(rooms[0]).to.deep.equals(room2);
      expect(rooms[1].mostRecentMessage).to.exist;
      delete rooms[1].mostRecentMessage;
      expect(rooms[1]).to.deep.equals(room1);
    });
  });

  describe('Get via http', () => {
    it('should return requested Room', async () => {
      const authorCreationArgs = {
        _id: '10cd568c-8be6-44d5-b464-3093255deab9',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs = {
        name: 'test_room1',
        authors: [author1],
      };

      const createRoomResponse = await request(app).post(`${baseRoomUrl}/`).send(roomCreationArgs);

      const { room: room1 } = createRoomResponse.body;

      const response = await request(app).get(`${baseRoomUrl}/${room1._id}`).expect(200);

      const { room } = response.body;
      expect(room).to.deep.equals(room1);
    });

    it('should throw and return not found error with non-existent Room', async () => {
      const invalidRoomId = '83f860ae-f6c3-4964-9af7-57247d417048';

      const response = await request(app).get(`${baseRoomUrl}/${invalidRoomId}`).expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Room not found.');
    });
  });

  describe('Update via http', () => {
    it('should update and return valid Room', async () => {
      const authorCreationArgs1 = {
        _id: '9f5fbc62-d82a-4620-a968-b99cd25cc1ef',
        firstName: 'John',
        lastName: 'Doe',
      };
      const authorCreationArgs2 = {
        _id: '3f6354a9-25ec-422e-b7b2-877b918b129a',
        firstName: 'Sam',
        lastName: 'Smith',
      };

      const createAuthorResponse1 = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs1);
      const createAuthorResponse2 = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs2);

      const { author: author1 } = createAuthorResponse1.body;
      const { author: author2 } = createAuthorResponse2.body;

      const roomCreationArgs = {
        name: 'test_room1',
        authors: [author1],
      };

      const createRoomResponse = await request(app).post(`${baseRoomUrl}/`).send(roomCreationArgs);

      const { room: room1 } = createRoomResponse.body;

      const updateArgs = {
        ...room1,
        name: 'updated_test_room1',
        authors: [author2],
      };

      const response = await request(app)
        .put(`${baseRoomUrl}/${room1._id}`)
        .send(updateArgs)
        .expect(200);

      const { room } = response.body;
      expect(room.updatedAt).to.exist;
      expect(room.updatedAt).to.not.equal(room1.updatedAt);
      delete room.updatedAt;
      delete updateArgs.updatedAt;
      expect(room.authors[0].isActive).to.be.true;
      delete room.authors[0].isActive;
      expect(room).to.deep.equals(updateArgs);
    });

    it('should throw and return validation error with invalid updates', async () => {
      const authorCreationArgs = {
        _id: 'f2907e85-f5e4-4874-910c-5ef3c2e8f684',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs = {
        name: 'test_room1',
        authors: [author1],
      };

      const createRoomResponse = await request(app).post(`${baseRoomUrl}/`).send(roomCreationArgs);

      const { room: room1 } = createRoomResponse.body;

      const updateArgs = {
        ...room1,
        name: '',
        authors: [],
      };

      const response = await request(app)
        .put(`${baseRoomUrl}/${room1._id}`)
        .send(updateArgs)
        .expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid field.');
      expect(error.fields.name).to.equal('required');
    });

    it('should throw and return not found error with non-existent Room', async () => {
      const invalidRoomId = 'f4aa2e96-657d-43ab-b658-b8d5306dc0d7';

      const response = await request(app)
        .put(`${baseRoomUrl}/${invalidRoomId}`)
        .send({ name: 'test_room', authors: [] })
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Room not found.');
    });
  });

  describe('Update via ws', () => {
    it('should update, emit and return valid Room', (done) => {
      const authorCreationArgs1 = {
        _id: 'ac18913a-3109-48bf-b690-dc43c3519658',
        firstName: 'John',
        lastName: 'Doe',
      };
      const authorCreationArgs2 = {
        _id: 'acf9e3d6-ed48-4e61-ae49-48b6e1ee1552',
        firstName: 'Sam',
        lastName: 'Smith',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs1)
        .then((createAuthorResponse1) => {
          const { author: author1 } = createAuthorResponse1.body;

          request(app)
            .post(`${baseAuthorUrl}/`)
            .send(authorCreationArgs2)
            .then((createAuthorResponse2) => {
              const { author: author2 } = createAuthorResponse2.body;

              const roomCreationArgs = {
                name: 'test_room',
                authors: [author1],
              };

              request(app)
                .post(`${baseRoomUrl}/`)
                .send(roomCreationArgs)
                .then((createRoomResponse) => {
                  const { room: room1 } = createRoomResponse.body;

                  remoteClientSocket.once(ROOM_JOINED, () => {
                    const updateValues = {
                      name: 'updated_test_room',
                      authors: [author2],
                    };

                    const updatedRoom = {
                      ...room1,
                      ...updateValues,
                    };

                    let numCalls = 0;
                    const cb = (data) => {
                      const { room, error } = data;
                      expect(error).to.not.exist;
                      expect(room.updatedAt).to.exist;
                      expect(room.updatedAt).to.not.equal(room1.updatedAt);
                      delete room.updatedAt;
                      delete updatedRoom.updatedAt;
                      expect(room.authors[0].isActive).to.be.true;
                      delete room.authors[0].isActive;
                      expect(room).to.deep.equals(updatedRoom);

                      // Called for both local and remote client
                      if (numCalls === 1) {
                        done();
                      }

                      numCalls += 1;
                    };

                    remoteClientSocket.once(ROOM_UPDATED, cb);

                    localClientSocket.emit(UPDATE_ROOM, { id: room1._id, updateValues }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, room1._id);
                });
            });
        });
    });

    it('should throw and return validation error with invalid updates', (done) => {
      const authorCreationArgs = {
        _id: 'f2907e85-f5e4-4874-910c-5ef3c2e8f684',
        firstName: 'John',
        lastName: 'Doe',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs)
        .then((createAuthorResponse) => {
          const { author: author1 } = createAuthorResponse.body;

          const roomCreationArgs = {
            name: 'test_room1',
            authors: [author1],
          };

          request(app)
            .post(`${baseRoomUrl}/`)
            .send(roomCreationArgs)
            .then((createRoomResponse) => {
              const { room: room1 } = createRoomResponse.body;

              const updateValues = {
                name: '',
                authors: [],
              };

              const cb = (data) => {
                const { room, error } = data;
                expect(room).to.not.exist;
                expect(error.message).to.equal('Invalid field.');
                expect(error.fields.name).to.equal('required');
                done();
              };

              localClientSocket.emit(UPDATE_ROOM, { id: room1._id, updateValues }, cb);
            });
        });
    });

    it('should throw and return not found error with non-existent Room', (done) => {
      const invalidRoomId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const updateValues = { name: 'test_room', authors: [] };

      const cb = (data) => {
        const { room, error } = data;
        expect(room).to.not.exist;
        expect(error.message).to.equal('Room not found.');
        done();
      };

      localClientSocket.emit(UPDATE_ROOM, { id: invalidRoomId, updateValues }, cb);
    });
  });

  describe('Archive via http', () => {
    it('should archive and return valid Room', async () => {
      const authorCreationArgs = {
        _id: 'aea91760-9dfd-45f2-a984-9ca776fea024',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs = {
        name: 'test_room',
        authors: [author1],
      };

      const createRoomResponse = await request(app).post(`${baseRoomUrl}/`).send(roomCreationArgs);

      const { room: room1 } = createRoomResponse.body;

      const messageCreationArgs = {
        roomId: room1._id,
        authorId: author1._id,
        text: 'test_text',
      };

      const createMessageResponse = await request(app)
        .post(`${baseMessageUrl}/`)
        .send(messageCreationArgs);

      const { message: message1 } = createMessageResponse.body;

      const response = await request(app).put(`${baseRoomUrl}/${room1._id}/archive`).expect(200);

      const { room } = response.body;
      expect(room.isArchived).to.be.true;
      expect(room.updatedAt).to.exist;
      delete room1.isArchived;
      delete room1.updatedAt;
      delete room.isArchived;
      delete room.updatedAt;
      expect(room).to.deep.equals(room1);

      const messageResponse = await request(app).get(`${baseMessageUrl}/${message1._id}`);

      const { message } = messageResponse.body;
      expect(message.isArchived).to.be.true;
    });

    it('should throw and return not found error with non-existent Room', async () => {
      const invalidRoomId = 'dab30744-cba4-4093-9338-3306743a6e11';

      const response = await request(app)
        .put(`${baseRoomUrl}/${invalidRoomId}/archive`)
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Room not found.');
    });
  });

  describe('Archive via ws', () => {
    it('should archive, emit and return valid Room', (done) => {
      const authorCreationArgs = {
        _id: '1f829bcf-cc20-419f-b165-fffaaaa214d1',
        firstName: 'John',
        lastName: 'Doe',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs)
        .then((createAuthorResponse) => {
          const { author: author1 } = createAuthorResponse.body;

          const roomCreationArgs = {
            name: 'test_room',
            authors: [author1],
          };

          request(app)
            .post(`${baseRoomUrl}/`)
            .send(roomCreationArgs)
            .then((createRoomResponse) => {
              const { room: room1 } = createRoomResponse.body;

              const messageCreationArgs = {
                roomId: room1._id,
                authorId: author1._id,
                text: 'test_text',
              };

              request(app)
                .post(`${baseMessageUrl}/`)
                .send(messageCreationArgs)
                .then((createMessageResponse) => {
                  const { message: message1 } = createMessageResponse.body;

                  remoteClientSocket.once(ROOM_JOINED, () => {
                    let numCalls = 0;
                    const cb = (data) => {
                      const { room, error } = data;
                      expect(error).to.not.exist;
                      expect(room.isArchived).to.be.true;
                      expect(room.updatedAt).to.exist;
                      delete room1.isArchived;
                      delete room1.updatedAt;
                      delete room.isArchived;
                      delete room.updatedAt;
                      expect(room).to.deep.equals(room1);

                      request(app)
                        .get(`${baseMessageUrl}/${message1._id}`)
                        .then((messageResponse) => {
                          const { message } = messageResponse.body;
                          expect(message.isArchived).to.be.true;

                          // Called for both local and remote client
                          if (numCalls === 1) {
                            done();
                          }

                          numCalls += 1;
                        });
                    };

                    remoteClientSocket.once(ROOM_ARCHIVED, cb);

                    localClientSocket.emit(ARCHIVE_ROOM, { id: room1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, room1._id);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Room', (done) => {
      const invalidRoomId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { room, error } = data;
        expect(room).to.not.exist;
        expect(error.message).to.equal('Room not found.');
        done();
      };

      localClientSocket.emit(ARCHIVE_ROOM, { id: invalidRoomId }, cb);
    });
  });

  describe('Delete via http', () => {
    it('should delete and return valid Room', async () => {
      const authorCreationArgs = {
        _id: 'fb49309f-3b66-4c68-8cce-a293122edcd1',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createAuthorResponse = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs);

      const { author: author1 } = createAuthorResponse.body;

      const roomCreationArgs = {
        name: 'test_room',
        authors: [author1],
      };

      const createRoomResponse = await request(app).post(`${baseRoomUrl}/`).send(roomCreationArgs);

      const { room: room1 } = createRoomResponse.body;

      const messageCreationArgs = {
        roomId: room1._id,
        authorId: author1._id,
        text: 'test_text',
      };

      const createMessageResponse = await request(app)
        .post(`${baseMessageUrl}/`)
        .send(messageCreationArgs);

      const { message: message1 } = createMessageResponse.body;

      const response = await request(app).delete(`${baseRoomUrl}/${room1._id}`).expect(200);

      const { room } = response.body;
      expect(room.authors.length).to.equal(1);
      expect(room.authors[0].author).to.equal(author1._id);
      delete room.authors;
      delete room1.authors;
      expect(room).to.deep.equals(room1);

      const messageResponse = await request(app).get(`${baseMessageUrl}/${message1._id}`);

      const { error } = messageResponse.body;
      expect(error.message).to.equal('Message not found.');
    });

    it('should throw and return not found error with non-existent Room', async () => {
      const invalidRoomId = 'c1a689c6-2bf6-4610-835a-37aeb337e95d';

      const response = await request(app).delete(`${baseRoomUrl}/${invalidRoomId}`).expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Room not found.');
    });
  });

  describe('Delete via ws', () => {
    it('should delete, emit and return valid Room', (done) => {
      const authorCreationArgs = {
        _id: '1f829bcf-cc20-419f-b165-fffaaaa214d1',
        firstName: 'John',
        lastName: 'Doe',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(authorCreationArgs)
        .then((createAuthorResponse) => {
          const { author: author1 } = createAuthorResponse.body;

          const roomCreationArgs = {
            name: 'test_room',
            authors: [author1],
          };

          request(app)
            .post(`${baseRoomUrl}/`)
            .send(roomCreationArgs)
            .then((createRoomResponse) => {
              const { room: room1 } = createRoomResponse.body;

              const messageCreationArgs = {
                roomId: room1._id,
                authorId: author1._id,
                text: 'test_text',
              };

              request(app)
                .post(`${baseMessageUrl}/`)
                .send(messageCreationArgs)
                .then((createMessageResponse) => {
                  const { message: message1 } = createMessageResponse.body;

                  remoteClientSocket.once(ROOM_JOINED, () => {
                    let numCalls = 0;
                    const cb = (data) => {
                      const { room, error } = data;
                      expect(error).to.not.exist;
                      expect(room.authors.length).to.equal(1);
                      expect(room.authors[0].author).to.equal(author1._id);
                      delete room.authors;
                      delete room1.authors;
                      expect(room).to.deep.equals(room1);

                      request(app)
                        .get(`${baseMessageUrl}/${message1._id}`)
                        .then((messageResponse) => {
                          const { error: messageError } = messageResponse.body;
                          expect(messageError.message).to.equal('Message not found.');

                          // Called for both local and remote client
                          if (numCalls === 1) {
                            done();
                          }

                          numCalls += 1;
                        });
                    };

                    remoteClientSocket.once(ROOM_DELETED, cb);

                    localClientSocket.emit(DELETE_ROOM, { id: room1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, room1._id);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Room', (done) => {
      const invalidRoomId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { room, error } = data;
        expect(room).to.not.exist;
        expect(error.message).to.equal('Room not found.');
        done();
      };

      localClientSocket.emit(DELETE_ROOM, { id: invalidRoomId }, cb);
    });
  });
});
