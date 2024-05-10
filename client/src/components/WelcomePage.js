import '../stylesheets/EntryPages.css';
import { useState } from 'react';
import axios from 'axios';
import Notification from './Notification.js';

export default function WelcomePage(props) {
  const changeActive = props.changeActive;
  const [notif, setNotif] = useState("");
  const closeNotif = () => {
    setNotif("");
  }
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  axios.get("http://localhost:8000/getLoggedIn")
    .then(response => {
      setIsLoggedIn(response.data.loggedIn);
      if(isLoggedIn) {
        setNotif("You are already logged in");
      }
    })
    .catch(error => {
      console.error('Error getting logged in', error);
    });
  
  const handleGuestClick = () => {
    setNotif("You are browsing as a Guest. Some features will be disabled.");
    setTimeout(() => {
      props.changeActive("Questions");
    }, 2000);
  }

  return (
    <>
    <div id="welcome">
      <h1>Welcome to fakeStackOverflow!</h1>
      <button onClick={() => {changeActive("Register")}} disabled = {isLoggedIn} >
        Register
      </button>
      <button onClick={() => {changeActive("Login")}} disabled = {isLoggedIn} >
        Login
      </button>
      <button onClick={handleGuestClick} disabled = {isLoggedIn} >Guest</button>
    </div>
    {notif === "You are already logged in." && 
      <Notification message={notif} onClose={closeNotif}/>
    }
    {notif === "You are browsing as a Guest. Some features will be disabled." && 
      <Notification message={notif} onClose={closeNotif}/>
    }
    </>
  );
}