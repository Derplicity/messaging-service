const { expect } = require('chai');
const request = require('supertest');
const { createServer } = require('http');
const Client = require('socket.io-client');

const {
  JOIN_ROOM,
  ROOM_JOINED,
  MESSAGE_CREATED,
  CREATE_MESSAGE,
  MESSAGE_UPDATED,
  UPDATE_MESSAGE,
  MESSAGE_ARCHIVED,
  ARCHIVE_MESSAGE,
  MESSAGE_DELETED,
  DELETE_MESSAGE,
} = require('../../src/config/eventTypes');
const { clearDatabase } = require('../helpers');
const app = require('../../src/app');

const baseAuthorUrl = '/api/v1/authors';
const baseRoomUrl = '/api/v1/rooms';
const baseMessageUrl = '/api/v1/messages';

describe('Message Integrations', () => {
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
    it('should create and return valid Message', async () => {
      const authorCreationArgs = {
        _id: 'd35db457-8f58-406c-94c9-7b3b6abf65b1',
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

      const response = await request(app).post(`${baseMessageUrl}/`).send(messageCreationArgs);

      const { message } = response.body;
      expect(message._id).to.exist;
      expect(response.headers.location).to.equal(`${baseMessageUrl}/${message._id}`);
      expect(message.roomId).to.equal(messageCreationArgs.roomId);
      expect(message.authorId).to.equal(messageCreationArgs.authorId);
      expect(message.text).to.equal(messageCreationArgs.text);
      expect(message.isArchived).to.be.false;
      expect(message.createdAt).to.exist;
      expect(message.updatedAt).to.exist;
    });

    it('should throw and return validation error with invalid Message', async () => {
      const response = await request(app).post(`${baseMessageUrl}/`).send({}).expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid fields.');
      expect(error.fields.roomId).to.equal('required');
      expect(error.fields.authorId).to.equal('required');
      expect(error.fields.text).to.equal('required');
    });
  });

  describe('Create via ws', () => {
    it('should create and return valid Message', (done) => {
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

              remoteClientSocket.once(ROOM_JOINED, () => {
                let numCalls = 0;
                const cb = (data) => {
                  const { message, error } = data;
                  expect(error).to.not.exist;
                  expect(message._id).to.exist;
                  expect(message.roomId).to.equal(messageCreationArgs.roomId);
                  expect(message.authorId).to.equal(messageCreationArgs.authorId);
                  expect(message.text).to.equal(messageCreationArgs.text);
                  expect(message.isArchived).to.be.false;
                  expect(message.createdAt).to.exist;
                  expect(message.updatedAt).to.exist;

                  // Called for both local and remote client
                  if (numCalls === 1) {
                    done();
                  }

                  numCalls += 1;
                };

                remoteClientSocket.once(MESSAGE_CREATED, cb);

                localClientSocket.emit(CREATE_MESSAGE, messageCreationArgs, cb);
              });

              remoteClientSocket.emit(JOIN_ROOM, author1._id);
            });
        });
    });

    it('should throw and return validation error with invalid Message', async () => {
      const cb = (data) => {
        const { room, error } = data;
        expect(room).to.not.exist;
        expect(error.message).to.equal('Invalid fields.');
        expect(error.fields.roomId).to.equal('required');
        expect(error.fields.authorId).to.equal('required');
        expect(error.fields.text).to.equal('required');
      };

      localClientSocket.emit(CREATE_MESSAGE, {}, cb);
    });
  });

  describe('Get All via http', () => {
    it('should return empty list', async () => {
      const response = await request(app).get(`${baseMessageUrl}/`).query({}).expect(200);

      const { messages } = response.body;
      expect(messages.length).to.equal(0);
    });

    it('should return list of Messages', async () => {
      const authorCreationArgs = {
        _id: '29ee3e23-3c18-4439-8078-694823206c68',
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

      const messageCreationArgs1 = {
        roomId: room1._id,
        authorId: author1._id,
        text: 'test_text1',
      };
      const messageCreationArgs2 = {
        roomId: room1._id,
        authorId: author1._id,
        text: 'test_text2',
      };

      const createMessageResponse1 = await request(app)
        .post(`${baseMessageUrl}/`)
        .send(messageCreationArgs1);
      const createMessageResponse2 = await request(app)
        .post(`${baseMessageUrl}/`)
        .send(messageCreationArgs2);

      const { message: message1 } = createMessageResponse1.body;
      const { message: message2 } = createMessageResponse2.body;

      const response = await request(app).get(`${baseMessageUrl}/`).query({}).expect(200);

      const { messages } = response.body;
      expect(messages.length).to.equal(2);
      expect(messages[0]).to.deep.equals(message2);
      expect(messages[1]).to.deep.equals(message1);
    });
  });

  describe('Get via http', () => {
    it('should return requested Message', async () => {
      const authorCreationArgs = {
        _id: '8f135d56-9cf2-4f54-ad49-ffadfe0efe60',
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

      const response = await request(app).get(`${baseMessageUrl}/${message1._id}`).expect(200);

      const { message } = response.body;
      expect(message).to.deep.equals(message1);
    });

    it('should throw and return not found error with non-existent Message', async () => {
      const invalidMessageId = 'ab95c50d-8670-459a-af92-e2b356621a46';

      const response = await request(app).get(`${baseMessageUrl}/${invalidMessageId}`).expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Message not found.');
    });
  });

  describe('Update via http', () => {
    it('should update and return valid Message', async () => {
      const authorCreationArgs = {
        _id: 'bb74ebfa-247c-4d16-900f-683021319ec7',
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

      const updateArgs = {
        ...message1,
        text: 'updated_test_text',
      };

      const response = await request(app)
        .put(`${baseMessageUrl}/${message1._id}`)
        .send(updateArgs)
        .expect(200);

      const { message } = response.body;
      expect(message.updatedAt).to.exist;
      expect(message.updatedAt).to.not.equal(message1.updatedAt);
      delete message.updatedAt;
      delete updateArgs.updatedAt;
      expect(message).to.deep.equals(updateArgs);
    });

    it('should throw and return validation error with invalid updates', async () => {
      const authorCreationArgs = {
        _id: '5d87cccf-fdda-4b82-8dca-ae667bf68ed1',
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

      const updateArgs = {
        ...message1,
        text: '',
      };

      const response = await request(app)
        .put(`${baseMessageUrl}/${message1._id}`)
        .send(updateArgs)
        .expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid field.');
      expect(error.fields.text).to.equal('required');
    });

    it('should throw and return not found error with non-existent Message', async () => {
      const invalidMessageId = '146e6601-c093-4de0-b054-4ab9386466e7';

      const response = await request(app)
        .put(`${baseMessageUrl}/${invalidMessageId}`)
        .send({ text: 'test_text' })
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Message not found.');
    });
  });

  describe('Update via ws', () => {
    it('should update, emit and return valid Message', (done) => {
      const authorCreationArgs = {
        _id: 'ac18913a-3109-48bf-b690-dc43c3519658',
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
                    const updateValues = {
                      text: 'updated_test_text',
                    };

                    const updatedMessage = {
                      ...message1,
                      ...updateValues,
                    };

                    let numCalls = 0;
                    const cb = (data) => {
                      const { message, error } = data;
                      expect(error).to.not.exist;
                      expect(message.updatedAt).to.exist;
                      expect(message.updatedAt).to.not.equal(message1.updatedAt);
                      delete message.updatedAt;
                      delete updatedMessage.updatedAt;
                      expect(message).to.deep.equals(updatedMessage);

                      // Called for both local and remote client
                      if (numCalls === 1) {
                        done();
                      }

                      numCalls += 1;
                    };

                    remoteClientSocket.once(MESSAGE_UPDATED, cb);

                    localClientSocket.emit(UPDATE_MESSAGE, { id: message1._id, updateValues }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, message1.roomId);
                });
            });
        });
    });

    it('should throw and return validation error with invalid updates', (done) => {
      const authorCreationArgs = {
        _id: 'ac18913a-3109-48bf-b690-dc43c3519658',
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

                  const updateValues = {
                    text: '',
                  };

                  const cb = (data) => {
                    const { message, error } = data;
                    expect(message).to.not.exist;
                    expect(error.message).to.equal('Invalid field.');
                    expect(error.fields.text).to.equal('required');
                    done();
                  };

                  localClientSocket.emit(UPDATE_MESSAGE, { id: message1._id, updateValues }, cb);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Room', (done) => {
      const invalidMessageId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const updateValues = { text: 'test_text' };

      const cb = (data) => {
        const { message, error } = data;
        expect(message).to.not.exist;
        expect(error.message).to.equal('Message not found.');
        done();
      };

      localClientSocket.emit(UPDATE_MESSAGE, { id: invalidMessageId, updateValues }, cb);
    });
  });

  describe('Archive via http', () => {
    it('should archive and return valid Message', async () => {
      const authorCreationArgs = {
        _id: 'd82ddbc1-c6ff-430b-817f-d5fa9d9c0448',
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

      const response = await request(app)
        .put(`${baseMessageUrl}/${message1._id}/archive`)
        .expect(200);

      const { message } = response.body;
      expect(message.isArchived).to.be.true;
      expect(message.updatedAt).to.exist;
      delete message1.isArchived;
      delete message1.updatedAt;
      delete message.isArchived;
      delete message.updatedAt;
      expect(message).to.deep.equals(message1);
    });

    it('should throw and return not found error with non-existent Message', async () => {
      const invalidMessageId = 'fba5e0ac-2b07-4a11-9669-dc2e62b10c04';

      const response = await request(app)
        .put(`${baseMessageUrl}/${invalidMessageId}/archive`)
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Message not found.');
    });
  });

  describe('Archive via ws', () => {
    it('should archive, emit and return valid Message', (done) => {
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
                      const { message, error } = data;
                      expect(error).to.not.exist;
                      expect(message.isArchived).to.be.true;
                      expect(message.updatedAt).to.exist;
                      delete message1.isArchived;
                      delete message1.updatedAt;
                      delete message.isArchived;
                      delete message.updatedAt;
                      expect(message).to.deep.equals(message1);

                      // Called for both local and remote client
                      if (numCalls === 1) {
                        done();
                      }

                      numCalls += 1;
                    };

                    remoteClientSocket.once(MESSAGE_ARCHIVED, cb);

                    localClientSocket.emit(ARCHIVE_MESSAGE, { id: message1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, message1.roomId);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Message', (done) => {
      const invalidMessageId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { message, error } = data;
        expect(message).to.not.exist;
        expect(error.message).to.equal('Message not found.');
        done();
      };

      localClientSocket.emit(ARCHIVE_MESSAGE, { id: invalidMessageId }, cb);
    });
  });

  describe('Delete via http', () => {
    it('should delete and return valid Message', async () => {
      const authorCreationArgs = {
        _id: 'dd527ad2-18a0-4dcf-b94e-e74e3692e1ad',
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

      const response = await request(app).delete(`${baseMessageUrl}/${message1._id}`).expect(200);

      const { message } = response.body;
      expect(message).to.deep.equals(message1);
    });

    it('should throw and return not found error with non-existent Message', async () => {
      const invalidMessageId = '2c347683-7fbf-4c19-8cff-2746907b6545';

      const response = await request(app)
        .delete(`${baseMessageUrl}/${invalidMessageId}`)
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Message not found.');
    });
  });

  describe('Delete via ws', () => {
    it('should delete, emit and return valid Message', (done) => {
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
                      const { message, error } = data;
                      expect(error).to.not.exist;
                      expect(message).to.deep.equals(message1);

                      // Called for both local and remote client
                      if (numCalls === 1) {
                        done();
                      }

                      numCalls += 1;
                    };

                    remoteClientSocket.once(MESSAGE_DELETED, cb);

                    localClientSocket.emit(DELETE_MESSAGE, { id: message1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, message1.roomId);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Message', (done) => {
      const invalidMessageId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { message, error } = data;
        expect(message).to.not.exist;
        expect(error.message).to.equal('Message not found.');
        done();
      };

      localClientSocket.emit(DELETE_MESSAGE, { id: invalidMessageId }, cb);
    });
  });
});
