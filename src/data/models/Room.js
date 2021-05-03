const mongoose = require('mongoose');

const uuid = require('../../util/uuid');
const helpers = require('../../util/helpers');
const Author = require('./Author');

const { Schema, model } = mongoose;

/**
 * Schema for Room objects.
 * @constant
 * @type {Schema}
 */
const roomSchema = new Schema(
  {
    _id: { type: String, default: () => uuid.generate() },
    name: { type: String, required: true },
    authors: [
      {
        _id: { id: false },
        author: { type: String, ref: 'Author' },
        isActive: { type: Boolean, default: true },
      },
    ],
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Validation for Authors array
roomSchema.path('authors').validate(
  async (values) => {
    const authorIds = values.map(({ author }) => author);
    if (helpers.arrayHasDuplicates(authorIds)) return false;

    let isValid = true;
    await Promise.all(
      values.map(async ({ author: authorId }) => {
        // Check that UUID is valid
        if (!uuid.validate(authorId)) {
          isValid = false;
          return;
        }

        // Check that Author exists
        const author = await Author.findById(authorId);

        if (!author) isValid = false;
      }),
    );

    return isValid;
  },
  '`{VALUE}` is not a valid uuid.',
  'invalid',
);

// Get Room model; create if not present
let Room;
try {
  Room = mongoose.model('Room');
} catch (err) {
  Room = model('Room', roomSchema);
}

/**
 * Exposes document model for Room objects in a MongoDB database.
 * @module data/models/Room
 * @see {@link module:data/models/Author}
 * @see {@link module:util/helpers}
 * @see {@link https://github.com/Automattic/mongoose}
 * @see {@link https://github.com/uuidjs/uuid}
 */
module.exports = Room;
