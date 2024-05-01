const bcrypt = require('bcrypt');
const User = require('./models/users.js');

const UserController = {};

// TODO: change status codes from 200 to 401
// 200 for testing and to allow alerts to pop-up

UserController.registerUser = async (req, res) => {
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
};

UserController.loginUser = async (req, res) => {
  try {
    // extract data from request body
    const { email, password } = req.body;

    // check if the user exists in the database using email field
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(200).json({ message: "Email is not registered" });
    }
    // check if the password entered matches the password for the user
    const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
    if (!passwordCorrect) {
      return res.status(200).json({ message: "Wrong password" });
    }
    return res.status(200).json({ message: 'Successful login' });
  } catch (error) {
      console.error('Failed to log in:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

// UserController.logoutUser = async (req, res) => {
  
// };

// UserController.getLoggedIn = async (req, res) => {
  
// };

module.exports = UserController;