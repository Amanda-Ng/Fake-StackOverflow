// Question Document Schema
const mongoose = require('mongoose')
const Tag = require('./tags.js')
const Answer = require('./answers.js')
const Comment = require('./comments.js')

const Schema = mongoose.Schema

const questionSchema = new Schema({
  title: {
    type: String,
    maxLength: 100,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  tags: {
    type: [Tag.schema],
    required: true
  },
  answers: {
    type: [Answer.schema]
  },
  asked_by: {
    type: String,
    default: 'Anonymous'
  },
  ask_date_time: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }, 
  votes: {
    type: Number,
    default: 0
  },
  comments: {
    type: [Comment.schema]
  }
})

questionSchema.virtual('url').get(function () {
  return `posts/question/${this._id}`
})

module.exports = mongoose.model('Question', questionSchema)