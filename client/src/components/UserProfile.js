import '../stylesheets/UserProfile.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function UserProfile(props) {
  const changeActive = props.changeActive;
  const [profileData, setProfileData] = useState(null);
  const [miniMenuPage, setMiniMenuPage] = useState("Q");

  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    retrieveProfileData()
    .then(data => {
      setProfileData({
        username: data[0],
        date: data[1],
        rep: data[2],
        questions: data[3],
        answers: data[4],
        tags: data[5],
      });
    })
    .catch(error => {
      console.error('Error retrieving profile data:', error);
    });
  }, []);
  
  // change what is shown based on mini menu
  const handleClick = (page) => {
    setMiniMenuPage(page);
  }

  // change what mini menu link is highlighted based on current page
  const miniQ = document.getElementById("mini-q");
  if(miniQ) {
    miniQ.style.backgroundColor = "rgb(219, 219, 219)";
  }
  useEffect(() => {
    const miniA = document.getElementById("mini-a");
    const miniT = document.getElementById("mini-t");
    // check miniQ, miniA, and miniA are not null
    if(miniQ && miniA && miniT) {
      miniQ.style.backgroundColor = "white";
      miniA.style.backgroundColor = "white";
      miniT.style.backgroundColor = "white";
    }
    if(miniMenuPage === "Q" && miniQ) {
      miniQ.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else if(miniMenuPage === "A" && miniA) {
      miniA.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else if(miniT) {
      miniT.style.backgroundColor = "rgb(219, 219, 219)";
    }
  }, [miniMenuPage, miniQ]);

  return (
    <div id="user-profile">
      {profileData && (
        <>
        <h1 className="username">{profileData.username}</h1>
        <span className="bio">🕓&nbsp;Member for {profileData.date}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="bio">🏆&nbsp;{profileData.rep} reputation points</span>
        {/* <div id="profile-content">
          <div id="mini-menu">
            <ul>
              <li id="mini-q"><button className="mini-link" onClick={() => {handleClick("Q")}}>
                Questions
                </button></li>
              <li id="mini-a"><button className="mini-link" onClick={() => {handleClick("A")}} >
                Answers
                </button></li>
              <li id="mini-t"><button className="mini-link" onClick={() => {handleClick("T")}} >
                Tags
                </button></li>
            </ul>
          </div>
        {profileData.questions && miniMenuPage === "Q" && profileData.questions.length > 0 && (
          <div>
            <h2>Asked Questions</h2>
            <ul className="mini-list">
              {profileData.questions.map(question => (
                <div className="mini-item" >
                  <li key={question._id} onClick={()=>{changeActive("NewQuestion")}} >{question.title}</li>
                  <button className="delete-button" >Delete</button>
                </div>
              ))}
            </ul>
          </div>
        )}
        {profileData.answers && miniMenuPage === "A" && profileData.answers.length > 0 && (
          <div>
            <h2>Answered Questions</h2>
            <ul className="mini-list">
              {profileData.answers.map(answer => (
                <div className="mini-item" >
                  <li key={answer._id} onClick={()=>{changeActive("NewAnswer")}} >{answer.title}</li>
                  <button className="delete-button" >Delete</button>
                </div>
              ))}
            </ul>
          </div>
        )}
        {profileData.tags && miniMenuPage === "T" && profileData.tags.length > 0 && (
          <div>
            <h2>Tags</h2>
            <ul className="mini-list">
              {profileData.tags.map(tag => (
                <div className="mini-item" >
                  <li key={tag._id} >{tag.name}</li>
                  <button className="delete-button" >Delete</button>
                </div>
              ))}
            </ul>
          </div>
        )}
        </div> */}
        </>
      )}
    </div>
  );
}

async function retrieveProfileData() {
  try {
    const response1 = await axios.get("http://localhost:8000/getLoggedIn");
    const userId = response1.data.userId;
    const response2 = await axios.post("http://localhost:8000/userProfile", { userId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    // const { username, date, rep, questions, answers, tags } = response2.data;
    const { username, date, rep, message } = response2.data;
    const formattedDate = formatTime(date);
    console.log(message);
    return [username, formattedDate, rep];
    // return [username, formattedDate, rep, questions, answers, tags];
  }
  catch(error) {
    console.error('Error getting user profile', error);
  }
}

// TODO: verify all cases
function formatTime(date) {
  const now = new Date();
  date = new Date(date); // JSON passes everything as Strings, so convert to Date here
  const diffInSeconds = Math.floor((now - date) / 1000); // diff in seconds
  const diffInMonths = Math.floor(diffInSeconds / (30 * 24 * 60 * 60)); // diff in months
  const diffInDays = Math.floor(diffInSeconds / (24 * 60 * 60)); // diff in days
  if(diffInMonths === 0) {
    if(diffInDays === 0) { return " 1 day"; }
    return ` ${diffInDays} days`;
  }
  if(diffInMonths === 1) { return " 1 month"; }
  if(diffInMonths < 12) { return ` ${diffInMonths} months`; }
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  if(months === 0) {
    return `${years} year${years > 1 ? 's' : ''}`;
  }
  return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
}