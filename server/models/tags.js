// Tag Document Schema
// import the mongoose module
const mongoose = require('mongoose')

// define schema
const Schema = mongoose.Schema
const tagSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tagCount: {
    type: Number,
    default: 0
  }
})
tagSchema.virtual('url').get(function () {
  return `posts/tag/${this._id}`
})

// compile model from schema
module.exports = mongoose.model('Tag', tagSchema)
