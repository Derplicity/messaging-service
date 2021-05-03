const bodyParser = require('body-parser');
const cors = require('cors');

module.exports = (app) => {
  // Body Parser Middleware
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Cors Middleware
  app.use(cors());
};
