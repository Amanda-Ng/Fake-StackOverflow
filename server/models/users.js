// User Document Schema
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const UserSchema = new Schema(
  {
    username: {
      type: String,
      // maxLength: 64,
      required: true
    },
    email: {
      type: String, 
      required: true 
    },
    passwordHash: { 
      type: String, 
      required: true 
    }
  },
  { timestamps: true },
)
module.exports = mongoose.model('User', UserSchema)