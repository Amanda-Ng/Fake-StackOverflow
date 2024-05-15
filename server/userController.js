const bcrypt = require('bcrypt')
const User = require('./models/users.js')
const { connection } = require('./mongooseConnection.js')
const Question = require('./models/questions.js')
const Answer = require('./models/answers.js')
const Tag = require('./models/tags.js')
const Comment = require('./models/comments.js')

const userController = {}

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
    try {
      await req.session.save();
    } catch (err) {
        console.error('Error saving to session storage: ', err);
    }

    return res.status(200).json({ success: true, sess: req.session })
  } catch (error) {
    console.error('Failed to log in:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

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
      tags: createdTags,
      isAdmin: userData.isAdmin
    })
  } catch (error) {
    console.error('Error retrieving user profile information:', error)
  }
}
userController.getUsernamesAndIds = async (req, res) => {
  try {
    const users = await User.find({}, '_id username isAdmin');
    const filteredUsers = users.filter(user => !user.isAdmin);
    const usernamesAndIds = filteredUsers.map(user => ({ id: user._id, username: user.username }));
    return res.status(200).json({ usernamesAndIds })
  } catch (error) {
    console.error('Error retrieving usernames and ids: ', error)
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

userController.editQuestion = async (req, res) => {
  try {
    const { questionId, newQuestionInput, editedTags, userId } = req.body;
    const question = await Question.findById(questionId);
    for (const tagName of question.tags) {
      await Tag.findOneAndUpdate(
        { name: tagName },
        { $inc: { tagCount: -1 } },
        { new: true }
      );
    }
    question.tags = [];

    const allTags = await Tag.find({});
    const allTagNames = allTags.map(tag => tag.name);
    const existingTags = [];
    const newTags = [];
    let foundTag;
    for (const tag of editedTags) {
      if (allTagNames.includes(tag)) {
        foundTag = allTags.find(t => t.name === tag);
        existingTags.push(foundTag);
      } else {
        newTags.push(tag);
      }
    }
    const createdTags = [];
    for(const tag of newTags) {
      createdTags.push(new Tag({ name: tag, userId }))
    }
    await Tag.insertMany(createdTags);

    const allTagsToAdd = [...existingTags, ...newTags];

    await Question.findOneAndUpdate(
      { _id: questionId  }, 
      { $set: { 
        title: newQuestionInput[0],
        text: newQuestionInput[1],  
        summary: newQuestionInput[2], 
        tags: allTagsToAdd
      } }, 
      { new: true }
    );
    return res.status(200).json({ success: true, newTags, existingTags }); 
  }
  catch(error) {
    console.error("Error editing the question:", error);
  }
}

userController.getAnswer = async (req, res) => {
  try {
    const { userId, answeredQ } = req.body;
    let answerToEdit;
    for(const answer of answeredQ.answers) {
      if(answer.userId.toString() === userId) {
        answerToEdit = answer;
        break;
      }
    }
    return res.status(200).json({ answerId: answerToEdit._id, answerText: answerToEdit.text }); 
  }
  catch(error) {
    console.error("Error editing the answer:", error);
  }
}
userController.editAnswer = async (req, res) => {
  try {
    const { answerId, newAnswerText } = req.body;
    await Question.findOneAndUpdate(
      { 'answers._id': answerId }, 
      { $set: { 'answers.$.text': newAnswerText } }, 
      { new: true }
    );
    await Answer.findOneAndUpdate(
      { _id: answerId }, 
      { $set: { text: newAnswerText } }, 
      { new: true }
    );
    return res.status(200).json({ success: true }); 
  }
  catch(error) {
    console.error("Error editing the answer:", error);
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

userController.deleteTag = async (req, res) => {
  try {
    const { tagId } = req.body;
    // update Question documents to remove any occurrence of this tag
    await Question.updateMany({ 'tags._id': tagId }, { $pull: { tags: { _id: tagId } } });
    // delete the tag
    await Tag.deleteOne({ _id: tagId });
    return res.status(200).json({ success: true }); 
  }
  catch(error) {
    console.error("Error deleting the tag:", error);
  }
}
userController.deleteUser = async (req, res) => {
  try {
    const { userId } = req.body
    // verify that the user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(200).json({ error: 'User not found' })
    }

    // clear questions collection of any mention of the user
    const questions = await Question.find({});
    for (const question of questions) {

      // delete the question asked by the user
      if(question.userId.toString() === userId) {
        for (const tag of question.tags) {
          // decrement the tagCount of tags associated with this question
          await Tag.findByIdAndUpdate(tag._id, { $inc: { tagCount: -1 } })
        }
        await Question.findByIdAndDelete(question._id);
      }
      else {
        // under answers of a question, delete the comments posted by the user 
        await Question.updateMany(
          { 'answers.comments.userId': userId },
          { $pull: { 'answers.$[].comments': { userId } } },
          { new: true }
        );
        // under a question, delete the answer posted by the user
        await Question.findByIdAndUpdate(
          question._id,
          { $pull: { answers: { userId } } },
          { new: true }
        );
        // under a question, delete the comments posted by the user 
        await Question.findByIdAndUpdate(
          question._id,
          { $pull: { comments: { userId } } },
          { new: true }
        );
      }  
    }
    // clear answers and comments collections of any mentions of the user
    const answers = await Answer.find()
    for(const answer of answers) {
      // convert ObjectId to String
      if(answer.userId.toString() === userId ) {
        // delete the answer
        await Answer.findByIdAndDelete(answer._id);
      }
      // under answers collection, delete comments by the user
      await Answer.findByIdAndUpdate(
        answer._id,
        { $pull: { comments: { userId} } },
        { new: true }
      );
    }
    await User.findByIdAndDelete(userId);
    return res.status(200).json({ success: true }); 
  }
  catch(error) {
    console.error("Error deleting the tag:", error);
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
