const mongoose = require('mongoose');

const uuid = require('../../util/uuid');
const Author = require('./Author');
const Room = require('./Room');

const { Schema, model } = mongoose;

/**
 * Schema for Message objects.
 * @constant
 * @type {Schema}
 */
const messageSchema = new Schema(
  {
    _id: { type: String, default: () => uuid.generate() },
    roomId: { type: String, ref: 'Room', required: true },
    authorId: { type: String, ref: 'Author', required: true },
    text: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Validation for Room id
messageSchema.path('roomId').validate(
  async (value) => {
    if (!uuid.validate(value)) return false;

    // Check that Room exists
    const room = await Room.findById(value);

    if (!room) return false;

    return true;
  },
  '`{VALUE}` is not a valid uuid.',
  'invalid',
);

// Validation for Author id
messageSchema.path('authorId').validate(
  async function validator(value) {
    if (!uuid.validate(value)) return false;

    // Check that Author exists
    const author = await Author.findById(value);

    if (!author) return false;

    // Check that Room contains Author
    const room = await Room.findById(this.roomId);

    if (room.authors.filter(({ author: authorId }) => authorId === value).length === 0)
      return false;

    return true;
  },
  '`{VALUE}` is not a valid uuid.',
  'invalid',
);

// Get Message model; create if not present
let Message;
try {
  Message = mongoose.model('Message');
} catch (err) {
  Message = model('Message', messageSchema);
}

/**
 * Exposes document model for Message objects in a MongoDB database.
 * @module data/models/Message
 * @see {@link module:data/models/Author}
 * @see {@link module:data/models/Room}
 * @see {@link https://github.com/Automattic/mongoose}
 * @see {@link https://github.com/uuidjs/uuid}
 */
module.exports = Message;
