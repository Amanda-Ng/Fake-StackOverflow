const bcrypt = require('bcrypt')
const User = require('./models/users.js')
const { connection } = require('./mongooseConnection.js')
const Question = require('./models/questions.js')
const Answer = require('./models/answers.js')
const Tag = require('./models/tags.js')
const Comment = require('./models/comments.js')
const questions = require('./models/questions.js')

const userController = {}

// TODO: change status codes from 200 to 401
// 200 for testing and to allow alerts to pop-up

userController.registerUser = async (req, res) => {
  const { username, email, password, rePassword } = req.body

  // check if email is valid
  const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/
  if (!emailPattern.test(email)) {
    return res.status(200).json({ message: 'Invalid email' })
  }
  // check if there already exists a user with the email being registered
  try {
    // find user in database using email field
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(200).json({ message: 'Email is already registered' })
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
  // check if the password contains the username or email identifier
  const emailIdentifier = email.slice(0, email.indexOf('@')).toLowerCase()
  const pwLower = password.toLowerCase()
  const userLower = username.toLowerCase()
  if (pwLower.includes(userLower) || pwLower.includes(emailIdentifier)) {
    return res.status(200).json({ message: 'Password must not include username or email' })
  }
  // check if password and re-entered password match
  if (password !== rePassword) {
    return res.status(200).json({ message: 'Passwords do not match' })
  }

  // encrypt the password
  const saltRounds = 10
  const salt = await bcrypt.genSalt(saltRounds)
  const passwordHash = await bcrypt.hash(password, salt)
  // create a new user with the valid inputs from the registration form
  const user = new User({
    username, email, passwordHash
  })

  // save the new user to the database
  await user.save()
  return res.status(201).json({ message: 'Successful registration' })
  // TODO: remove message and replace with the below
  // return res.status(201).json({ success: true });
}

userController.loginUser = async (req, res) => {
  try {
    // extract data from request body
    const { email, password } = req.body

    // check if the user exists in the database using email field
    const userData = await User.findOne({ email })
    if (!userData) {
      return res.status(200).json({ message: 'Email is not registered' })
    }
    // check if the password entered matches the password for the user
    const passwordCorrect = await bcrypt.compare(password, userData.passwordHash)
    if (!passwordCorrect) {
      return res.status(200).json({ message: 'Wrong password' })
    }
    req.session.userId = userData._id
    req.session.save()
    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to log in:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// TODO: logoutUser requires further testing
userController.logoutUser = async (req, res) => {
  const collection = connection.db.collection('sessions')
  // delete all sessions (there should only be 1)
  await collection.deleteMany({})
  // Date(0) returns a date from 1970 so the cookie is expired
  res.cookie('token', '', { expires: new Date(0) })
  return res.json({ success: true })
}

userController.getLoggedIn = async (req, res) => {
  const collection = connection.db.collection('sessions')
  const sessionData = await collection.find({}).toArray()
  // sessions collection will be empty when there's no user logged in
  if (sessionData[0] !== undefined) {
    // there should only be 1 document in sessions at a time
    const parsed = JSON.parse(sessionData[0].session)
    const userId = parsed.userId
    return res.status(200).json({ loggedIn: true, userId })
  } else {
    // user is a guest
    return res.status(200).json({ loggedIn: false })
  }
}

userController.getUserProfileData = async (req, res) => {
  const { userId } = req.body
  const userData = await User.findById(userId)
  if (!userData) {
    return res.status(200).json({ message: 'Cannot find user profile' })
  }
  // get all necessary profile information to return
  try {
    const askedQuestions = await Question.find({ userId })
    const answeredQuestions = await Question.find({ 'answers.userId': userId })
    const createdTags = await Tag.find({ userId })
    return res.status(200).json({
      username: userData.username,
      date: userData.createdAt,
      reputation: userData.reputation,
      questions: askedQuestions,
      answeredQuestions: answeredQuestions,
      tags: createdTags
    })
  } catch (error) {
    console.error('Error retrieving user profile information:', error)
  }
}

userController.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.body
    // verify that the question exists
    const question = await Question.findById(questionId)
    if (!question) {
      return res.status(200).json({ error: 'Question not found' })
    }
    // delete all answers associated with this question
    for(const answer of question.answers) {
      // delete all comments associated with the answers
      for (const comment of answer.comments) {
        await Comment.findByIdAndDelete(comment._id)
      }
      await Answer.findByIdAndDelete(answer._id)
    }
    // delete or update all tags associated with this question
    for (const tag of question.tags) {
      // if the tag is only associated with this question, delete it
      // otherwise, decrement tagCount
      if (tag.tagCount === 1) {
        await Tag.findByIdAndDelete(tag._id)
      } else {
        await Tag.findByIdAndUpdate(tag._id, { $inc: { tagCount: -1 } })
      }
    }
    // delete all comments associated with this question
    for (const comment of question.comments) {
      await Comment.findByIdAndDelete(comment._id)
    }
    // delete the question
    await Question.findByIdAndDelete(questionId);
    return res.status(200).json({ message: "Question successfully deleted" });
  }
  catch(error) {
    console.error("Error deleting question:", error);
  }
}

userController.deleteAnswer = async (req, res) => {
  try {
    const { userId, answeredQId } = req.body;
    // verify that the answered question exists
    const answeredQuestion = await Question.findById(answeredQId);
    if (!answeredQuestion) {
      return res.status(200).json({ error: 'Question not found' });
    }
    // delete the Answer document
    // accounts for if a user submitted multiple answers to a question
    for(const answer of answeredQuestion.answers) {
      // convert ObjectId to String
      if(answer.userId.toString() === userId ) {
        // first delete all comments associated with this answer
        for(const comment of answer.comments) {
          await Comment.findByIdAndDelete(comment._id);
        }
        // delete the answer
        await Answer.findByIdAndDelete(answer._id);
      }
    }
    // update Question document to remove this answer
    await Question.updateOne({ _id: answeredQId }, { $pull: { answers: { userId: userId } } });
    // return new list of answeredQuestions after deleting an answer
    return res.status(200).json({ message: "Answer successfully deleted" });
  }
  catch(error) {
    console.error("Error deleting answer:", error);
  }
}

userController.verifyEditableTag = async (req, res) => {
  try {
    const { userId, tagId, tagCount } = req.body;
    // if only 1 question is using this tag, then it's the user's question
    if(tagCount == 1) {
      return res.status(200).json({ editable: true }); 
    }
    // check the users who posted questions with this tag
    const questionsWithTag = await Question.find({ 'tags._id': tagId });
    for(const question of questionsWithTag) {
      if(question.userId.toString() !== userId) {
        return res.status(200).json({ editable: false }); 
      }
    }
    return res.status(200).json({ editable: true }); 
  }
  catch(error) {
    console.error("Error verifying if the tag could be edited:", error);
  }
}

userController.editTag = async (req, res) => {
  try {
    const { tagId, newTagName } = req.body;
    // update the questions' tag array for any tags that match the tagId
    // tags.$.name updates the nested tag's name directly
    await Question.updateMany({ 'tags._id': tagId }, { $set: { 'tags.$.name': newTagName } });
    // update the tag's name
    await Tag.updateOne({ _id: tagId }, { $set: { name: newTagName } });
    return res.status(200).json({ success: true }); 
  }
  catch(error) {
    console.error("Error editing the tag:", error);
  }
}

userController.getUsername = async (req, res) => {
  const { userId } = req.body
  // find all userData using userId
  const userData = await User.findById(userId)
  if (!userData) {
    return res.status(200).json({ message: 'Cannot find username' })
  }
  return res.status(200).json({ username: userData.username })
}

userController.updateReputation = async (req, res) => {
  const { userId, changeOfPoints } = req.body
  // find all userData using userId
  const userData = await User.findById(userId)
  if (!userData) {
    return res.status(200).json({ success: false })
  }
  await User.findByIdAndUpdate(userId, { $inc: { reputation: changeOfPoints } })
  return res.status(200).json({ success: true })
}


module.exports = userController
