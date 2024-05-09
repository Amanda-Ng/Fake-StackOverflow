// Comments Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

module.exports = mongoose.model('Comment', commentSchema)
