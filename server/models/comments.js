// Comments Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./users.js')

// Define the Comment schema
const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Comment', commentSchema);