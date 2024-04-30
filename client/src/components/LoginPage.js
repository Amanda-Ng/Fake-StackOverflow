import '../stylesheets/App.css';
import { useState } from 'react';
import axios from 'axios';

export default function LoginPage(props) {
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
      const response = await axios.post("http://localhost:8000/login", {
        email: loginEmail,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const msg = response.data.message;
      // TODO: alert for unsuccessful logins does not show
      // either replace alerts with a pop-up or change status code in server.js
      alert(msg);
      if(msg !== "Successful login") {
        return false;
      }
    }
    catch(error) {
      console.error('Error verifying credentials:', error);
    }
  }

  return (
    <div id="registration">
      {/* method="POST" */}
      <form onSubmit={handleSubmit} id="registration-form" >
        <label htmlFor="email" >Email</label>
        <input type="text" id="email" name="loginEmail" value={formData.newEmail} onChange={handleChange} required ></input>
        <label htmlFor="pw" >Password</label>
        <input type="text" id="pw" name="loginPassword" value={formData.newPassword} onChange={handleChange} required ></input>
        <input type="submit" value="Login" />
      </form>
  </div> 
  );
}