// Application server

// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const Question = require('./models/questions.js')
const Tag = require('./models/tags.js')
const Answer = require('./models/answers.js')
const Comment = require('./models/comments.js')

// connect to MongoDB
const mongoDB = 'mongodb://127.0.0.1:27017/fake_so'
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
const connection = mongoose.connection
connection.on('error', console.error.bind(console, 'MongoDB connection error'))

// resolves HTTP request from port 3000 being blocked by CORS policy
app.use(cors())

// Parse JSON bodies
app.use(bodyParser.json())

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// Use the router for all requests
app.use(router)

app.get('/', function (req, res) {
  res.send('EXPRESS WORKING')
})

// route to handle GET requests to fetch tags data
app.get('/tags', async (req, res) => {
  try {
    const collection = connection.db.collection('tags')
    const tagsData = await collection.find({}).toArray()
    res.json(tagsData)
  } catch (err) {
    console.error('Error fetching tags:', err)
  }
})

// route to handle GET requests to fetch questions data
app.get('/questions', async (req, res) => {
  try {
    const collection = connection.db.collection('questions')
    const questionsData = await collection.find({}).toArray()
    res.json(questionsData)
  } catch (err) {
    console.error('Error fetching questions:', err)
  }
})

// Define a route to handle GET requests for a specific question by id
router.get('/questions/:id', async (req, res) => {
  try {
    // Extract the question id from the request parameters
    const { id } = req.params

    // Find the question in the database by id
    const question = await Question.findById(id)

    // If the question is found, send it as a response
    if (question) {
      res.json(question)
    } else {
      // If the question is not found, return a 404 error
      res.status(404).json({ error: 'Question not found' })
    }
  } catch (error) {
    // Handle errors
    console.error('Error fetching question:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Route to handle POST requests to add a new question
router.post('/questions', async (req, res) => {
  try {
    // Extract data from request body
    const { title, text, tags, username } = req.body

    const questionTags = []

    for (const tag of tags) {
      // Check if the tag exists in the database
      let existingTag = await Tag.findOne({ name: tag })

      // If tag doesn't exist, add it to the database
      if (!existingTag) {
        // Create a new tag object
        existingTag = new Tag({ name: tag })
        // Save the new tag to the database
        await existingTag.save()
        questionTags.push(existingTag)
      } else {
        questionTags.push(existingTag)
      }
    }

    // Create a new question object
    const newQuestion = new Question({
      title,
      text,
      tags: questionTags,
      asked_by: username,
      ask_date_time: new Date()
    })

    // Save the new question to the database
    await newQuestion.save()
    // Send a success response with the saved question data
    res.status(201).json()
  } catch (error) {
    // Handle errors
    console.error('Error adding question:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Define a route to handle POST requests to add a new answer to a question
router.post('/questions/:qid/answers', async (req, res) => {
  try {
    // Extract the question id (qid) from the request parameters
    const { qid } = req.params

    // Extract the answer data from the request body
    const { username, text } = req.body

    // Create a new answer object
    const newAnswer = new Answer({
      ans_by: username,
      text,
      ans_date_time: new Date()
    })

    // Save the new answer to the database
    const savedAnswer = await newAnswer.save()

    // Update the question document to add the new answer
    await Question.findByIdAndUpdate(
      qid,
      { $push: { answers: savedAnswer } }, // Add the new answer object to the answers array
      { new: true } // Return the updated document after the update operation
    )

    // Send a success response with the saved answer data
    res.status(201).json(savedAnswer)
  } catch (error) {
    // Handle errors
    console.error('Error adding new answer:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Define a route to handle PUT requests to update views count by id
router.put('/questions/:id/views', async (req, res) => {
  try {
    // Extract the question id from the request parameters
    const { id } = req.params

    // Find the question in the database by id
    const question = await Question.findById(id)

    // If the question is found, increment views count and save
    if (question) {
      question.views += 1
      await question.save()
      res.json({ message: 'Views count updated successfully' })
    } else {
      // If the question is not found, return a 404 error
      res.status(404).json({ error: 'Question not found' })
    }
  } catch (error) {
    // Handle errors
    console.error('Error updating views count:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Define a route to handle PUT requests to decrement views count by id after answer form submitted
router.put('/questions/:id/answer/views', async (req, res) => {
  try {
    // Extract the question id from the request parameters
    const { id } = req.params

    // Find the question in the database by id
    const question = await Question.findById(id)

    // If the question is found, increment views count and save
    if (question) {
      question.views -= 1
      await question.save()
      res.json({ message: 'Views count updated successfully' })
    } else {
      // If the question is not found, return a 404 error
      res.status(404).json({ error: 'Question not found' })
    }
  } catch (error) {
    // Handle errors
    console.error('Error updating views count:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Define a route handler to add a new comment to the database
router.post('/:aid/comments', async (req, res) => {
  try {
    // Extract the answer id from the request parameters
    const { id } = req.params
    const { content } = req.body;

    // Create a new Comment instance with the provided content
    const newComment = new Comment({
      content: content
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();

    // Update the amswer document to add the new answer
    await Answer.findByIdAndUpdate(
      aid,
      { $push: { comments: savedComment } }, // Add the new comment object to the comments array
      { new: true } // Return the updated document after the update operation
    )

    res.status(201).json(newComment); // Respond with the newly created comment
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// start server
const server = app.listen(8000, () => {
  console.log('Server is running on port 8000')
})

// handle server termination
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Server closed. Database instance disconnected.')
    connection.close(false, () => {
      process.exit(0)
    })
  })
})

module.exports = router