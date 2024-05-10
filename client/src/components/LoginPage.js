import '../stylesheets/EntryPages.css';
import { useState } from 'react';
import axios from 'axios';
import Notification from './Notification';

export default function LoginPage(props) {
  // for showing notifications about incorrect credentials
  const [notif, setNotif] = useState("");
  const closeNotif = () => {
    setNotif("");
  }
  const [formData, setFormData] = useState({
    loginEmail: '',
    loginPassword: ''
  });
  // change formData when values are entered into the form
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { loginEmail, loginPassword } = formData;
    try {
      // send credentials to be validated on server side
      const response = await axios.post("http://localhost:8000/loginUser", {
        email: loginEmail,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(!response.data.success) {
        setNotif(response.data.message);
        return false;
      }
      setNotif("Successful login");
      // delay changing active page to show successful notification message
      setTimeout(() => {
        props.changeActive("Questions");
      }, 1000);
    }
    catch(error) {
      console.error('Error verifying credentials:', error);
    }
  }

  return (
    <>
    <div id="login">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} id="login-form" method="POST" >
        <label htmlFor="email" ></label>
        <input type="email" id="email" name="loginEmail" value={formData.loginEmail} onChange={handleChange} placeholder="Email" required ></input>
        <label htmlFor="pw" ></label>
        <input type="password" id="pw" name="loginPassword" value={formData.loginPassword} onChange={handleChange} placeholder="Password" required ></input>
        <input type="submit" id="login-button" value="Login" />
      </form>
  </div> 
  {notif && <Notification message={notif} onClose={closeNotif} /> }
  </>
  );
}