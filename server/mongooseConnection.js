const mongoose = require('mongoose')

// connect to MongoDB
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.on('error', console.error.bind(console, 'MongoDB connection error'))

module.exports.connection = connection
