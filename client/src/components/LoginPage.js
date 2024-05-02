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
      const response = await axios.post("http://localhost:8000/loginUser", {
        email: loginEmail,
        password: loginPassword
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      // TODO: alerts should be replaced by actual UI notification
      if(!response.data.success) {
        alert(response.data.message);
        return false;
      }
      alert("Successful login");
      props.changeActive("Welcome");
    }
    catch(error) {
      console.error('Error verifying credentials:', error);
    }
  }

  const testingGetLoggedIn = async () => {
    try {
      const response = await axios.get("http://localhost:8000/getLoggedIn");
      if(response.data.loggedIn) {
        console.log(response.data.userId);
      }
      else {
        console.log("GUEST");
      }
    }
    catch(error) {
      console.error('Error getting logged in', error);
    }
  }
  const testingLogout = async () => {
    try {
      const response = await axios.get("http://localhost:8000/logout");
      console.log(response.data.success);
    }
    catch(error) {
      console.error('Error logging out', error);
    }
  }
  return (
    <div id="login">
      <form onSubmit={handleSubmit} id="login-form" method="POST" >
        <label htmlFor="email" >Email</label>
        <input type="text" id="email" name="loginEmail" value={formData.loginEmail} onChange={handleChange} required ></input>
        <label htmlFor="pw" >Password</label>
        <input type="text" id="pw" name="loginPassword" value={formData.loginPassword} onChange={handleChange} required ></input>
        <input type="submit" value="Login" />
      </form>
      <button onClick={testingGetLoggedIn}>testing getLoggedIn</button>
      <button onClick={testingLogout}>testing Logout</button>
  </div> 
  );
}