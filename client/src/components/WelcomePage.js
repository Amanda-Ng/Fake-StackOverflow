import '../stylesheets/WelcomePage.css';
import { useState } from 'react';
import axios from 'axios';
import Notification from './Notification.js';

export default function WelcomePage(props) {
  const changeActive = props.changeActive;
  const [showNotif, setShowNotif] = useState(false);
  const closeNotif = () => {
    setShowNotif(false);
  }
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  axios.get("http://localhost:8000/getLoggedIn")
    .then(response => {
      setIsLoggedIn(response.data.loggedIn);
      setShowNotif(response.data.loggedIn);
    })
    .catch(error => {
      console.error('Error getting logged in', error);
    });
  return (
    <>
    <div id="welcome">
      <button onClick={() => {changeActive("Register")}} disabled = {isLoggedIn} >Register</button>
      <button onClick={() => {changeActive("Login")}} disabled = {isLoggedIn} >Login</button>
      <button disabled = {isLoggedIn} >Guest</button>
    </div>
    {showNotif && 
      <Notification message="You are already logged in" onClose={closeNotif}/>
    }
    </>
  );
}