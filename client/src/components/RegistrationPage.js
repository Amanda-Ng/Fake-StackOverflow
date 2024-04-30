import '../stylesheets/App.css';
import { useState } from 'react';
import axios from 'axios';

export default function RegistrationPage(props) {
  // empty registration form
  const [formData, setFormData] = useState({
    newUsername: '',
    newEmail: '',
    newPassword: '',
    rePassword: '',
  });
  // change formData when values are entered into the form
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    // prevent refresh if submission is invalid
    e.preventDefault();
    const { newUsername, newEmail, newPassword, rePassword } = formData;
    // prevent refresh if invalid inputs using await
    if(await validateRegisterForm(newUsername, newEmail, newPassword, rePassword)) {
      try {
        // send POST request to server
        await axios.post('http://localhost:8000/users', {
          username: newUsername,
          email: newEmail,
          password: newPassword
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        props.changeActive("Welcome");
      } catch (error) {
          console.error('Error adding new user:', error);
      }
    }
  };
  return (
    <div id="registration">
      <form onSubmit={handleSubmit} id="registration-form" method="POST" >
        <label htmlFor="user" >Username</label>
        <input type="text" id="user" name="newUsername" value={formData.newUsername} onChange={handleChange} required ></input>
        <label htmlFor="email" >Email</label>
        <input type="text" id="email" name="newEmail" value={formData.newEmail} onChange={handleChange} required ></input>
        <label htmlFor="pw" >Password</label>
        <input type="text" id="pw" name="newPassword" value={formData.newPassword} onChange={handleChange} required ></input>
        <label htmlFor="rePw" >Re-enter Password</label>
        <input type="text" id="rePw" name="rePassword" value={formData.rePassword} onChange={handleChange} required ></input>
        <input type="submit" value="Register" />
      </form>
  </div> 
  );
}

async function validateRegisterForm(username, email, password, rePassword) {
  // check if email is valid
  const emailPattern = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if(!emailPattern.test(email)) {
    alert("Invalid email address");
    return false;
  }
  // check if password and re-entered password match
  if(password !== rePassword) {
    alert("Passwords do not match");
    return false;
  }
  // check if there already exists a user with the email being registered
  const validateUniqueEmail = async (formEmail) => {
    try {
      const response = await axios.get("http://localhost:8000/userEmails");
      return !response.data.some(user => user.email === formEmail);
    }
    catch(error) {
      console.error('Error getting user emails:', error);
    }
    return false;
  }
  // the return statements in validateUniqueEmail will not stop execution of validateRegisterForm
  const isEmailUnique = await validateUniqueEmail(email);
  if(!isEmailUnique) { 
    alert("Email already in use");
    return false; 
  }

  // check if the password contains the username or email identifier
  const emailIdentifier = email.slice(0,email.indexOf('@')).toLowerCase();
  password = password.toLowerCase();
  username = username.toLowerCase();
  if(password.indexOf(username) >= 0 || password.indexOf(emailIdentifier) >= 0) {
    alert("Password cannot contain username or email address identifier");
    return false;
  }
  return true;
}