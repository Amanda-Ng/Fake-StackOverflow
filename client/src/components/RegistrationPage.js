import axios from 'axios';
import '../stylesheets/App.css';
import { useState } from 'react';

export default function RegistrationPage(props) {
  const changeActive = props.changeActive;
  // empty registration form
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    rePassword: '',
  });
  
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, rePassword } = formData;
    const valid = validateRegisterForm(username, email, password, rePassword);
  };
  return (
    <div id="registration">
      {/* method="POST" */}
      <form onSubmit={handleSubmit} id="registration-form" >
        <label htmlFor="newUsername" >Username</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required ></input>
        <label htmlFor="newEmail" >Email</label>
        <input type="text" name="email" value={formData.email} onChange={handleChange} required ></input>
        <label htmlFor="newPassword" >Password</label>
        <input type="text" name="password" value={formData.password} onChange={handleChange} required ></input>
        <label htmlFor="reenterPassword" >Re-enter Password</label>
        <input type="text" name="rePassword" value={formData.rePassword} onChange={handleChange} required ></input>
        <input type="submit" value="Register" />
      </form>
  </div> 
  );
}

function validateRegisterForm(username, email, password, rePassword) {
  const emailPattern = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/;
  if(!emailPattern.test(email)) {
    alert("Invalid email address");
    return false;
  }
  if(password !== rePassword) {
    alert("Passwords do not match");
    return false;
  }
  // const uniqueEmail = async () => {
  //   try {
  //     await axios.get("http://localhost:8000/users", {

  //     });
  //   }
  //   catch(error) {
  //     console.error('Error getting user emails:', error);
  // }
  // };

  const emailIdentifier = email.slice(0,email.indexOf('@')).toLowerCase();
  password = password.toLowerCase();
  if(password.indexOf(username.toLowerCase()) >= 0 || password.indexOf(emailIdentifier) >= 0) {
    alert("Password cannot contain username or email address identifier");
    return false;
  }
}