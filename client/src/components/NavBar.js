import '../stylesheets/NavBar.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function NavBar(props) {
  const changeActive = props.changeActive;
  const enterPressed = (e) => {
    if(e.key === 'Enter') {
      changeActive("Search");
      // changes searchString's state in App
      props.handleSearch(e.target.value);
    }
  };
  
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);
  // check if the user is logged in everytime the activePage changes
  useEffect(() => {
    axios.get("http://localhost:8000/getLoggedIn")
      .then(response => {
        setIsLoggedIn(response.data.loggedIn);
      })
      .catch(error => {
        console.error('Error getting logged in', error);
      });
  },[props.activePage]);
  
  // use axios to end session
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:8000/logout");
      setIsLoggedIn(false);
    }
    catch(error) {
      console.error("Error logging out:", error);
    }
  };
  
  return (
    <div id="header" className="header">
      <button id="header-title" className="header-title" onClick={() => {changeActive("Welcome")}}>
        fake<b>StackOverflow</b>
      </button>
      <input id="search" type="text" placeholder="Search . . ." onKeyDown={enterPressed} />
      <div className="nav-buttons">
      {isLoggedIn ? (
        <>
          <button className="white-button" onClick={() => {changeActive("Welcome")}}>Profile</button>
          &nbsp;
          <button className="white-button" onClick={() => {handleLogout(); changeActive("Welcome");}}>Logout</button>
        </>
      ) : (
        <>
          <button className="white-button" onClick={() => {changeActive("Login")}}>Log in</button>
          &nbsp;
          <button className="blue-button" onClick={() => {changeActive("Register")}}>Sign up</button>
        </>
      )}
      </div>
    </div>
  );
}