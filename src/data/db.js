const mongoose = require('mongoose');

/* istanbul ignore next */
module.exports = {
  /**
   * Create a connection to a Mongo database
   *
   * @param {string} uri
   */
  connect(uri) {
    return new Promise((resolve, reject) => {
      mongoose
        .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
        .then(() => {
          console.log('Connected to Database.');
          resolve();
        })
        .catch((err) => {
          console.error(err);
          reject(err);
        });
    });
  },

  /**
   * Close the connection to the Mongo database
   */
  close() {
    return mongoose.disconnect();
  },
};
