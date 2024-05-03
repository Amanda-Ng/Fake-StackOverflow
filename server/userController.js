const bcrypt = require('bcrypt');
const User = require('./models/users.js');
const { connection } = require('./mongooseConnection.js');

const userController = {};

// TODO: change status codes from 200 to 401
// 200 for testing and to allow alerts to pop-up

userController.registerUser = async (req, res) => {
  const { username, email, password, rePassword } = req.body;

  // check if email is valid
  const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if(!emailPattern.test(email)) {
    return res.status(200).json({ message: 'Invalid email' });
  }
  // check if there already exists a user with the email being registered
  try {
    // find user in database using email field
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json({ message: 'Email is already registered' }); 
    }
  } catch (error) {
      console.error('Error verifying email:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
  // check if the password contains the username or email identifier
  const emailIdentifier = email.slice(0,email.indexOf('@')).toLowerCase();
  const pwLower = password.toLowerCase();
  const userLower = username.toLowerCase();
  if(pwLower.includes(userLower) || pwLower.includes(emailIdentifier)) {
    return res.status(200).json({ message: 'Password must not include username or email' });
  }
  // check if password and re-entered password match
  if(password !== rePassword) {
    return res.status(200).json({ message: 'Passwords do not match' });
  }
  
  // encrypt the password
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);
  // create a new user with the valid inputs from the registration form
  const user = new User({
    username, email, passwordHash
  });

  // save the new user to the database
  await user.save(); 
  return res.status(201).json({ message: 'Successful registration' }); 
  // TODO: remove message and replace with the below
  // return res.status(201).json({ success: true });
};

userController.loginUser = async (req, res) => {
  try {
    // extract data from request body
    const { email, password } = req.body;

    // check if the user exists in the database using email field
    const userData = await User.findOne({ email });
    if (!userData) {
      return res.status(200).json({ message: "Email is not registered" });
    }
    // check if the password entered matches the password for the user
    const passwordCorrect = await bcrypt.compare(password, userData.passwordHash);
    if (!passwordCorrect) {
      return res.status(200).json({ message: "Wrong password" });
    }
    req.session.userId = userData._id;
    req.session.save();
    return res.status(200).json({ success: true });
  } catch (error) {
      console.error('Failed to log in:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// TODO: logoutUser requires further testing
userController.logoutUser = async (req, res) => {
  const collection = connection.db.collection('sessions');
  // delete all sessions (there should only be 1)
  const result = await collection.deleteMany({});
  // Date(0) returns a date from 1970 so the cookie is expired
  res.cookie('token', '', { expires: new Date(0) });
  return res.json({ success: true });
};

userController.getLoggedIn = async (req, res) => {
  const collection = connection.db.collection('sessions');
  const sessionData = await collection.find({}).toArray();
  // sessions collection will be empty when there's no user logged in
  if (sessionData[0] !== undefined) {
    // there should only be 1 document in sessions at a time
    const parsed = JSON.parse(sessionData[0].session);
    const userId = parsed.userId;
    return res.status(200).json({ loggedIn: true, userId: userId });
  } 
  else {
      // user is a guest
      return res.status(200).json({ loggedIn: false });
  }
};
userController.getUserData = async (req, res) => {
  const { userId }= req.body;
  const userData = await User.findById(userId);
  if (!userData) {
    return res.status(200).json({ message: "Cannot find user profile" });
  }
  return res.status(200).json({ 
    date: userData.createdAt,
    rep: "rep points to be implemented",
    questions: "array of questions asked",
    answers: "array of answers",
    tags: "",
  });
}
module.exports = userController;