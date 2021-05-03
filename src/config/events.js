module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
  });

  // Connect events
  io.on('connection', (socket) => require('../api/events')(socket));
};
