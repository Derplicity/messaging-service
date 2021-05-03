const mongoose = require('mongoose');

const uuid = require('../../util/uuid');

const { Schema, model } = mongoose;

/**
 * Schema for Author objects.
 * @constant
 * @type {Schema}
 */
const authorSchema = new Schema(
  {
    _id: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Validation for Author id
authorSchema
  .path('_id')
  .validate((value) => uuid.validate(value), '`{VALUE}` is not a valid uuid.', 'invalid');

// Get Author model; create if not present
let Author;
try {
  Author = mongoose.model('Author');
} catch (err) {
  Author = model('Author', authorSchema);
}

/**
 * Exposes document model for Author objects in a MongoDB database.
 * @module data/models/Message
 * @see {@link https://github.com/Automattic/mongoose}
 * @see {@link https://github.com/uuidjs/uuid}
 */
module.exports = Author;
