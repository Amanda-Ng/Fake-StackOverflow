import '../stylesheets/EntryPages.css';
import { useState } from 'react';
import axios from 'axios';
import Notification from './Notification';

export default function RegistrationPage(props) {
  // for showing notifications about incorrect 
  const [notif, setNotif] = useState("");
  const closeNotif = () => {
    setNotif("");
  }
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
      const message = response.data.message;
      setNotif(message);
      if(message === "Successful registration") {
        // delay changing active page to show successful notification message
        setTimeout(() => {
          props.changeActive("Login");
        }, 1200);
      }
    } catch (error) {
        console.error('Error adding new user:', error);
    }
  };
  return (
    <>
    <div id="registration">
      <h1>Create an account on fakeStackOverflow</h1>
      <form onSubmit={handleSubmit} id="registration-form" method="POST" >
        <label htmlFor="user" ></label>
        <input type="text" id="user" name="newUsername" value={formData.newUsername} onChange={handleChange} placeholder="Username" required ></input>
        <label htmlFor="email" ></label>
        <input type="text" id="email" name="newEmail" value={formData.newEmail} onChange={handleChange} placeholder="Email" required ></input>
        <label htmlFor="pw" ></label>
        <input type="password" id="pw" name="newPassword" value={formData.newPassword} onChange={handleChange} placeholder="Password" required ></input>
        <label htmlFor="rePw" ></label>
        <input type="password" id="rePw" name="rePassword" value={formData.rePassword} onChange={handleChange} placeholder="Re-enter Password" required ></input>
        <input id="register-button" type="submit" value="Register" />
      </form>
  </div> 
  {notif && <Notification message={notif} onClose={closeNotif} />}
  </>
  );
}