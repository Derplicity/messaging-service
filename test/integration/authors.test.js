const { expect } = require('chai');
const request = require('supertest');
const { createServer } = require('http');
const Client = require('socket.io-client');

const {
  UPDATE_AUTHOR,
  AUTHOR_UPDATED,
  JOIN_ROOM,
  ROOM_JOINED,
  ARCHIVE_AUTHOR,
  AUTHOR_ARCHIVED,
  DELETE_AUTHOR,
  AUTHOR_DELETED,
} = require('../../src/config/eventTypes');
const { clearDatabase } = require('../helpers');
const app = require('../../src/app');

const baseAuthorUrl = '/api/v1/authors';
const baseRoomUrl = '/api/v1/rooms';
const baseMessageUrl = '/api/v1/messages';

describe('Author Integrations', () => {
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
    it('should create and return valid Author', async () => {
      const creationArgs = {
        _id: '41668507-6033-4d14-a6e0-8c9af94e92ab',
        firstName: 'John',
        lastName: 'Doe',
      };

      const response = await request(app)
        .post(`${baseAuthorUrl}/`)
        .send(creationArgs)
        .expect(201)
        .expect('location', `${baseAuthorUrl}/${creationArgs._id}`);

      const { author } = response.body;
      expect(author._id).to.equal(creationArgs._id);
      expect(author.firstName).to.equal(creationArgs.firstName);
      expect(author.lastName).to.equal(creationArgs.lastName);
      expect(author.isArchived).to.be.false;
      expect(author.createdAt).to.exist;
      expect(author.updatedAt).to.exist;
    });

    it('should throw and return validation error with invalid Author', async () => {
      const response = await request(app).post(`${baseAuthorUrl}/`).send({}).expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid fields.');
      expect(error.fields._id).to.equal('required');
      expect(error.fields.firstName).to.equal('required');
      expect(error.fields.lastName).to.equal('required');
    });
  });

  describe('Get All via http', () => {
    it('should return empty list', async () => {
      const response = await request(app).get(`${baseAuthorUrl}/`).query({}).expect(200);

      const { authors } = response.body;
      expect(authors.length).to.equal(0);
    });

    it('should return list of Authors', async () => {
      const creationArgs1 = {
        _id: '85db9c12-ae66-4d50-9239-f737ed0074ad',
        firstName: 'John',
        lastName: 'Doe',
      };
      const creationArgs2 = {
        _id: 'c236e0b6-905a-495d-8df9-882b17bc31b9',
        firstName: 'Sam',
        lastName: 'Smith',
      };

      const createResponse1 = await request(app).post(`${baseAuthorUrl}/`).send(creationArgs1);
      const createResponse2 = await request(app).post(`${baseAuthorUrl}/`).send(creationArgs2);

      const { author: author1 } = createResponse1.body;
      const { author: author2 } = createResponse2.body;

      const response = await request(app).get(`${baseAuthorUrl}/`).query({}).expect(200);

      const { authors } = response.body;
      expect(authors.length).to.equal(2);
      expect(authors[0]).to.deep.equals(author2);
      expect(authors[1]).to.deep.equals(author1);
    });
  });

  describe('Get via http', () => {
    it('should return requested Author', async () => {
      const creationArgs = {
        _id: 'a35aa37c-7e98-4a31-9b8e-549c1001da5b',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createResponse = await request(app).post(`${baseAuthorUrl}/`).send(creationArgs);

      const { author: author1 } = createResponse.body;

      const response = await request(app).get(`${baseAuthorUrl}/${author1._id}`).expect(200);

      const { author } = response.body;
      expect(author).to.deep.equals(author1);
    });

    it('should throw and return not found error with non-existent Author', async () => {
      const invalidAuthorId = '83f860ae-f6c3-4964-9af7-57247d417048';

      const response = await request(app).get(`${baseAuthorUrl}/${invalidAuthorId}`).expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Author not found.');
    });
  });

  describe('Update via http', () => {
    it('should update and return valid Author', async () => {
      const creationArgs = {
        _id: 'ac18913a-3109-48bf-b690-dc43c3519658',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createResponse = await request(app).post(`${baseAuthorUrl}/`).send(creationArgs);

      const { author: author1 } = createResponse.body;

      const updateArgs = {
        ...author1,
        firstName: 'Sam',
        lastName: 'Smith',
      };

      const response = await request(app)
        .put(`${baseAuthorUrl}/${author1._id}`)
        .send(updateArgs)
        .expect(200);

      const { author } = response.body;
      expect(author.updatedAt).to.exist;
      expect(author.updatedAt).to.not.equal(author1.updatedAt);
      delete author.updatedAt;
      delete updateArgs.updatedAt;
      expect(author).to.deep.equals(updateArgs);
    });

    it('should throw and return validation error with invalid updates', async () => {
      const creationArgs = {
        _id: '1dbb1beb-fd92-4780-9599-7dda2d9d8a97',
        firstName: 'John',
        lastName: 'Doe',
      };

      const createResponse = await request(app).post(`${baseAuthorUrl}/`).send(creationArgs);

      const { author: author1 } = createResponse.body;

      const updateArgs = {
        ...author1,
        firstName: '',
        lastName: '',
      };

      const response = await request(app)
        .put(`${baseAuthorUrl}/${author1._id}`)
        .send(updateArgs)
        .expect(400);

      const { error } = response.body;
      expect(error.message).to.equal('Invalid fields.');
      expect(error.fields.firstName).to.equal('required');
      expect(error.fields.lastName).to.equal('required');
    });

    it('should throw and return not found error with non-existent Author', async () => {
      const invalidAuthorId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const response = await request(app)
        .put(`${baseAuthorUrl}/${invalidAuthorId}`)
        .send({ firstName: 'Sam', lastName: 'Smith' })
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Author not found.');
    });
  });

  describe('Update via ws', () => {
    it('should update, emit and return valid Author', (done) => {
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

              remoteClientSocket.once(ROOM_JOINED, () => {
                const updateValues = {
                  firstName: 'Sam',
                  lastName: 'Smith',
                };

                const updatedAuthor = {
                  ...author1,
                  ...updateValues,
                };

                let numCalls = 0;
                const cb = (data) => {
                  const { author, error } = data;
                  expect(error).to.not.exist;
                  expect(author.updatedAt).to.exist;
                  expect(author.updatedAt).to.not.equal(author1.updatedAt);
                  delete author.updatedAt;
                  delete updatedAuthor.updatedAt;
                  expect(author).to.deep.equals(updatedAuthor);

                  // Called for both local and remote client
                  if (numCalls === 1) {
                    done();
                  }

                  numCalls += 1;
                };

                remoteClientSocket.once(AUTHOR_UPDATED, cb);

                localClientSocket.emit(UPDATE_AUTHOR, { id: author1._id, updateValues }, cb);
              });

              remoteClientSocket.emit(JOIN_ROOM, room1._id);
            });
        });
    });

    it('should throw and return validation error with invalid updates', (done) => {
      const creationArgs = {
        _id: '1dbb1beb-fd92-4780-9599-7dda2d9d8a97',
        firstName: 'John',
        lastName: 'Doe',
      };

      request(app)
        .post(`${baseAuthorUrl}/`)
        .send(creationArgs)
        .then((createResponse) => {
          const { author: author1 } = createResponse.body;

          const updateValues = {
            firstName: '',
            lastName: '',
          };

          const cb = (data) => {
            const { author, error } = data;
            expect(author).to.not.exist;
            expect(error.message).to.equal('Invalid fields.');
            expect(error.fields.firstName).to.equal('required');
            expect(error.fields.lastName).to.equal('required');
            done();
          };

          localClientSocket.emit(UPDATE_AUTHOR, { id: author1._id, updateValues }, cb);
        });
    });

    it('should throw and return not found error with non-existent Author', (done) => {
      const invalidAuthorId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const updateValues = { firstName: 'Sam', lastName: 'Smith' };

      const cb = (data) => {
        const { author, error } = data;
        expect(author).to.not.exist;
        expect(error.message).to.equal('Author not found.');
        done();
      };

      localClientSocket.emit(UPDATE_AUTHOR, { id: invalidAuthorId, updateValues }, cb);
    });
  });

  describe('Archive via http', () => {
    it('should archive and return valid Author', async () => {
      const authorCreationArgs = {
        _id: '1f829bcf-cc20-419f-b165-fffaaaa214d1',
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
        .put(`${baseAuthorUrl}/${author1._id}/archive`)
        .expect(200);

      const { author } = response.body;
      expect(author.isArchived).to.be.true;
      expect(author.updatedAt).to.exist;
      delete author1.isArchived;
      delete author1.updatedAt;
      delete author.isArchived;
      delete author.updatedAt;
      expect(author).to.deep.equals(author1);

      const roomResponse = await request(app).get(`${baseRoomUrl}/${room1._id}`);

      const { room } = roomResponse.body;
      expect(room.isArchived).to.be.true;

      const messageResponse = await request(app).get(`${baseMessageUrl}/${message1._id}`);

      const { message } = messageResponse.body;
      expect(message.isArchived).to.be.true;
    });

    it('should throw and return not found error with non-existent Author', async () => {
      const invalidAuthorId = '3866387b-2d2a-4696-ad96-4097256ee90a';

      const response = await request(app)
        .put(`${baseAuthorUrl}/${invalidAuthorId}/archive`)
        .expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Author not found.');
    });
  });

  describe('Archive via ws', () => {
    it('should archive, emit and return valid Author', (done) => {
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
                      const { author, error } = data;
                      expect(error).to.not.exist;
                      expect(author.isArchived).to.be.true;
                      expect(author.updatedAt).to.exist;
                      delete author1.isArchived;
                      delete author1.updatedAt;
                      delete author.isArchived;
                      delete author.updatedAt;
                      expect(author).to.deep.equals(author1);

                      request(app)
                        .get(`${baseRoomUrl}/${room1._id}`)
                        .then((roomResponse) => {
                          const { room } = roomResponse.body;
                          expect(room.isArchived).to.be.true;

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
                        });
                    };

                    remoteClientSocket.once(AUTHOR_ARCHIVED, cb);

                    localClientSocket.emit(ARCHIVE_AUTHOR, { id: author1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, room1._id);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Author', (done) => {
      const invalidAuthorId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { author, error } = data;
        expect(author).to.not.exist;
        expect(error.message).to.equal('Author not found.');
        done();
      };

      localClientSocket.emit(ARCHIVE_AUTHOR, { id: invalidAuthorId }, cb);
    });
  });

  describe('Delete via http', () => {
    it('should delete and return valid Author', async () => {
      const authorCreationArgs = {
        _id: '6b18615c-6995-43f3-ab81-caa12f881240',
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

      const response = await request(app).delete(`${baseAuthorUrl}/${author1._id}`).expect(200);

      const { author } = response.body;
      expect(author).to.deep.equals(author1);

      const roomResponse = await request(app).get(`${baseRoomUrl}/${room1._id}`);

      const { error: roomError } = roomResponse.body;
      expect(roomError.message).to.equal('Room not found.');

      const messageResponse = await request(app).get(`${baseMessageUrl}/${message1._id}`);

      const { error: messageError } = messageResponse.body;
      expect(messageError.message).to.equal('Message not found.');
    });

    it('should throw and return not found error with non-existent Author', async () => {
      const invalidAuthorId = '3866387b-2d2a-4696-ad96-4097256ee90a';

      const response = await request(app).delete(`${baseAuthorUrl}/${invalidAuthorId}`).expect(404);

      const { error } = response.body;
      expect(error.message).to.equal('Author not found.');
    });
  });

  describe('Delete via ws', () => {
    it('should delete, emit and return valid Author', (done) => {
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
                      const { author, error } = data;
                      expect(error).to.not.exist;
                      expect(author).to.deep.equals(author1);

                      request(app)
                        .get(`${baseRoomUrl}/${room1._id}`)
                        .then((roomResponse) => {
                          const { error: roomError } = roomResponse.body;
                          expect(roomError.message).to.equal('Room not found.');

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
                        });
                    };

                    remoteClientSocket.once(AUTHOR_DELETED, cb);

                    localClientSocket.emit(DELETE_AUTHOR, { id: author1._id }, cb);
                  });

                  remoteClientSocket.emit(JOIN_ROOM, room1._id);
                });
            });
        });
    });

    it('should throw and return not found error with non-existent Author', (done) => {
      const invalidAuthorId = '6b5b8f4c-eaa0-41e9-ae1c-0206be2d3baa';

      const cb = (data) => {
        const { author, error } = data;
        expect(author).to.not.exist;
        expect(error.message).to.equal('Author not found.');
        done();
      };

      localClientSocket.emit(DELETE_AUTHOR, { id: invalidAuthorId }, cb);
    });
  });
});
