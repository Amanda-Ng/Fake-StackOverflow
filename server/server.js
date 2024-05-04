// Application server

// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

// TODO: add semicolons
// TODO: change app to router in some instances
const express = require('express')

const { connection } = require('./mongooseConnection.js');
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session');
const MongoStore = require('connect-mongo');

const router = express.Router()
const app = express()

const Question = require('./models/questions.js')
const Tag = require('./models/tags.js')
const Answer = require('./models/answers.js')
const Comment = require('./models/comments.js')

const userController = require('./userController.js');

// resolves HTTP request from port 3000 being blocked by CORS policy
app.use(cors())

// Parse JSON bodies
app.use(bodyParser.json())

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }))

// express session setup must be done before router setup
// cookie config's maxAge is 1 hour and httpOnly is true by default
// TODO: review if sameSite config is appropriate
const hour = 6*60*10000;
app.use(session({
  // TODO: fix secret config
  // process.env.SESSION_SECRET
  secret: "what a secret!",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: true, 
    sameSite: "none",
    maxAge: hour
  },
  store: MongoStore.create({ mongoUrl: "mongodb://127.0.0.1/fake_so" }),
}));

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
    const { title, text, summary, tags, username } = req.body

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
      summary,
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
router.post('/answer/:aid/comments', async (req, res) => {
  try {
    // Extract the answer id from the request parameters
    const { aid } = req.params
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

// Define a route handler to add a new comment to the database
router.post('/question/:qid/comments', async (req, res) => {
  try {
    // Extract the question id from the request parameters
    const { qid } = req.params
    const { content } = req.body;

    // Create a new Comment instance with the provided content
    const newComment = new Comment({
      content: content
    });

    // Save the new comment to the database
    const savedComment = await newComment.save();

    // Update the question document to add the new question
    await Question.findByIdAndUpdate(
      qid,
      { $push: { comments: savedComment } },
      { new: true }
    );

    res.status(201).json(newComment); // Respond with the newly created comment
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to increment answer comment votes
router.put('/answers/comments/:commentId/votes', async (req, res) => {
  const { commentId } = req.params;

  try {
    // Find the comment in your database by its ID and increment the votes
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Increment the votes for the comment
    comment.votes += 1;

    // Save the updated comment back to the database
    await comment.save();

    // Find the parent answer containing this comment
    const answer = await Answer.findOne({ 'comments._id': commentId });

    if (!answer) {
      return res.status(404).json({ error: 'Associated answer not found' });
    }

    // Update the votes for the corresponding comment in the answer's 'comments' array
    const updatedComments = answer.comments.map((c) =>
      c._id.equals(comment._id) ? { ...c.toObject(), votes: comment.votes } : c
    );

    // Update the answer's 'comments' array with the modified comment
    answer.comments = updatedComments;

    // Save the updated answer back to the database
    await answer.save();

    // Respond with the updated comment (optional)
    res.json(comment);
  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route handler to fetch comments for a specific answer
router.get('/answers/:aid/comments', async (req, res) => {
  const { aid } = req.params; // Extract the answer ID from request params

  try {
    // Find the answer by ID and populate the 'comments' field
    const answer = await Answer.findById(aid).populate('comments');

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // Extract comments from the populated 'comments' field
    const comments = answer.comments;

    // Respond with the fetched comments
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments for answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define a route handler to fetch comments for a specific question
router.get('/questions/:qid/comments', async (req, res) => {
  const { qid } = req.params; // Extract the question ID from request params

  try {
    // Find the question by ID and populate the 'comments' field
    const question = await Question.findById(qid).populate('comments');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Extract comments from the populated 'comments' field
    const comments = question.comments;

    // Respond with the fetched comments
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments for question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to fetch answers for a specific question by ID
router.get('/questions/:qid/answers', async (req, res) => {
  try {
    const { qid } = req.params;

    // Find the question by ID and populate the 'answers' field
    const question = await Question.findById(qid).populate('answers');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Extract answers from the populated 'answers' field
    const answers = question.answers;

    // Respond with the fetched answers
    res.status(200).json(answers);
  } catch (error) {
    console.error('Error fetching answers for question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to increment question comment votes
router.put('/questions/comments/:commentId/votes', async (req, res) => {
  const { commentId } = req.params;

  try {
    // Find the comment in your database by its ID and increment the votes
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Increment the votes for the comment
    comment.votes += 1;

    // Save the updated comment back to the database
    await comment.save();

    // Find the parent question containing this comment
    const question = await Question.findOne({ 'comments._id': commentId });

    if (!question) {
      return res.status(404).json({ error: 'Associated question not found' });
    }

    // Update the votes for the corresponding comment in the question's 'comments' array
    const updatedComments = question.comments.map((c) =>
      c._id.equals(comment._id) ? { ...c.toObject(), votes: comment.votes } : c
    );

    // Update the question's 'comments' array with the modified comment
    question.comments = updatedComments;

    // Save the updated question back to the database
    await question.save();

    // Respond with the updated comment (optional)
    res.json(comment);
  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to increment question votes
router.put('/questions/:qId/upvote', async (req, res) => {
  const { qId } = req.params;

  try {
    const question = await Question.findByIdAndUpdate(
      qId,
      { $inc: { votes: 1 } }, // Increment votes by 1
      { new: true } // Return updated question after update
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating question upvotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to decrement question votes
router.put('/questions/:qId/downvote', async (req, res) => {
  const { qId } = req.params;

  try {
    const question = await Question.findByIdAndUpdate(
      qId,
      { $inc: { votes: -1 } }, // Decrement votes by 1
      { new: true } // Return updated question after update
    );

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating question downvotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to increment answer votes
router.put('/answers/:aId/upvote', async (req, res) => {
  const { aId } = req.params;

  try {
    const answer = await Answer.findByIdAndUpdate(
      aId,
      { $inc: { votes: 1 } }, // Increment votes by 1
      { new: true } // Return updated answer after update
    );

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // After updating the answer, find the parent question containing this answer
    const question = await Question.findOne({ 'answers._id': aId });

    if (!question) {
      return res.status(404).json({ error: 'Parent question not found for this answer' });
    }

    // Update the parent question's answers array to reflect the updated answer
    const updatedAnswers = question.answers.map((ans) =>
      ans._id.equals(answer._id) ? { ...ans.toObject(), votes: answer.votes } : ans
    );

    question.answers = updatedAnswers;

    // Save the updated question back to the database
    await question.save();

    res.json(answer);
  } catch (error) {
    console.error('Error updating answer upvotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route handler to decrement answer votes
router.put('/answers/:aId/downvote', async (req, res) => {
  const { aId } = req.params;

  try {
    const answer = await Answer.findByIdAndUpdate(
      aId,
      { $inc: { votes: -1 } }, // Decrement votes by 1
      { new: true } // Return updated answer after update
    );

    if (!answer) {
      return res.status(404).json({ error: 'Answer not found' });
    }

    // After updating the answer, find the parent question containing this answer
    const question = await Question.findOne({ 'answers._id': aId });

    if (!question) {
      return res.status(404).json({ error: 'Parent question not found for this answer' });
    }

    // Update the parent question's answers array to reflect the updated answer
    const updatedAnswers = question.answers.map((ans) =>
      ans._id.equals(answer._id) ? { ...ans.toObject(), votes: answer.votes } : ans
    );

    question.answers = updatedAnswers;

    // Save the updated question back to the database
    await question.save();

    res.json(answer);
  } catch (error) {
    console.error('Error updating answer downvotes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// userController router handlers
router.post('/register', userController.registerUser);
router.post('/loginUser', userController.loginUser);
router.get('/getLoggedIn', userController.getLoggedIn);
router.get('/logout', userController.logoutUser);
router.post('/userProfile', userController.getUserProfileData);
router.post('/username', userController.getUsername);

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

module.exports = router;