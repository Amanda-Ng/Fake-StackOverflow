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
    try {
      // send POST request to server
      const response = await axios.post('http://localhost:8000/register', {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        rePassword: rePassword,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(response.data.message);
      if(response.data.message === "Successful registration") {
        // TODO: alert should be replaced by actual UI notification
        alert("Successful registration");
        props.changeActive("Welcome");
      }
    } catch (error) {
        console.error('Error adding new user:', error);
    }
  };
  // TODO: change password fields type to password (visible for testing)
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