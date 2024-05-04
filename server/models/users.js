// User Document Schema
const mongoose = require('mongoose')
// const Tag = require('./tags.js');
// const Answer = require('./answers.js');
// const Question = require('./questions.js');

const Schema = mongoose.Schema
const UserSchema = new Schema(
  {
    username: {
      type: String,
      maxLength: 64,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    reputation: {
      type: Number,
      default: 50
    },
    isAdmin: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)
module.exports = mongoose.model('User', UserSchema)
