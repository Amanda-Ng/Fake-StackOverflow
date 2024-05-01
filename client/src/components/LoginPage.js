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
      const msg = response.data.message;
      // TODO: alert should be replaced by actual UI notification
      alert(msg);
      if(msg !== "Successful login") {
        return false;
      }
      props.changeActive("Welcome");
    }
    catch(error) {
      console.error('Error verifying credentials:', error);
    }
  }

  return (
    <div id="registration">
      {/* method="POST" */}
      <form onSubmit={handleSubmit} id="login-form" >
        <label htmlFor="email" >Email</label>
        <input type="text" id="email" name="loginEmail" value={formData.loginEmail} onChange={handleChange} required ></input>
        <label htmlFor="pw" >Password</label>
        <input type="text" id="pw" name="loginPassword" value={formData.loginPassword} onChange={handleChange} required ></input>
        <input type="submit" value="Login" />
      </form>
  </div> 
  );
}