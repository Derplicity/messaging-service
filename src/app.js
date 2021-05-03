const fs = require('fs');
const { join } = require('path');
const express = require('express');

const models = join(__dirname, 'data/models');
const app = express();

// Setup models
fs.readdirSync(models)
  // eslint-disable-next-line no-bitwise
  .filter((file) => ~file.search(/^[^.].*\.js$/))
  // eslint-disable-next-line import/no-dynamic-require
  .forEach((file) => require(join(models, file)));

// Setup middleware
require('./config/express')(app);

// Setup routes
require('./config/routes')(app);

module.exports = app;
