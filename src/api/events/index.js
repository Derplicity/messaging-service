/**
 * Exposes Socket.io endpoints.
 * @module api/events
 * @see {@link https://github.com/socketio/socket.io}
 */
module.exports = (socket) => {
  /**
   * Author Events
   * @see {@link module:api/events/authors}
   */
  require('./authors')(socket);

  /**
   * Room Events
   * @see {@link module:api/events/rooms}
   */
  require('./rooms')(socket);

  /**
   * Message Events
   * @see {@link module:api/events/messages}
   */
  require('./messages')(socket);
};
