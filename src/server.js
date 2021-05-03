require('dotenv').config();

const { createServer } = require('http');

const app = require('./app');
const db = require('./data/db');
const config = require('./config');

const server = createServer(app);

// Setup event handlers
require('./config/events')(server);

const port = config.PORT;

// Connect to database, then create app server
db.connect(config.MONGODB_URI).then(() => {
  server.listen(port, () => console.log(`Messaging Service listening on port ${port}`));
});
