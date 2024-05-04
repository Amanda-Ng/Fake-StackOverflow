import '../stylesheets/UserProfile.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function UserProfile(props) {
  const changeActive = props.changeActive;
  const [profileData, setProfileData] = useState(null);
  const [miniMenuPage, setMiniMenuPage] = useState("Q");

  // put all the data retrieved into profileData
  const setupProfileData = async () => {
    retrieveProfileData()
    .then(data => {
      setProfileData({
        username: data[0],
        date: data[1],
        reputation: data[2],
        questions: data[3],
        answers: data[4],
        tags: data[5]
      });
    })
    .catch(error => {
      console.error('Error retrieving profile data:', error);
    });
  }
  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    setupProfileData();
  }, []);

  const deleteQuestion = async (questionId) => {
    try {
      await axios.post("http://localhost:8000/deleteQuestion", { questionId }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    catch(error) {
      console.error('Error deleting question:', error);
    }
    // to refresh the data shown after a question is deleted
    setupProfileData();
  }
  
  // change what is shown based on mini menu
  const handleMenuClick = (page) => {
    setMiniMenuPage(page);
  }

  // change what mini menu link is highlighted based on current page
  useEffect(() => {
    // mini-q is highlighted initially in UserProfile.css
    const miniQ = document.getElementById("mini-q");
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
  }, [miniMenuPage]);

  return (
    <div id="user-profile">
      {profileData && (
        <>
        <h1 className="username">{profileData.username}</h1>
        <span className="bio">🕓&nbsp;Member for {profileData.date}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="bio">🏆&nbsp;{profileData.reputation} reputation points</span>
        <div id="profile-content">
          <div id="mini-menu">
            <ul>
              <li id="mini-q"><button className="mini-link" onClick={() => {handleMenuClick("Q")}}>
                Questions
                </button></li>
              <li id="mini-a"><button className="mini-link" onClick={() => {handleMenuClick("A")}} >
                Answers
                </button></li>
              <li id="mini-t"><button className="mini-link" onClick={() => {handleMenuClick("T")}} >
                Tags
                </button></li>
            </ul>
          </div>
        {profileData.questions && miniMenuPage === "Q" && (
          <div>
            <h2>Asked Questions</h2>
            {profileData.questions.length > 0 ? (
              <ul className="mini-list">
                {profileData.questions.map(question => (
                  <div className="mini-item" key={question._id} >
                    <li onClick={()=>{changeActive("NewQuestion")}} >{question.title}</li>
                    <button className="delete-button" onClick={() => {deleteQuestion(question._id)}} >Delete</button>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="empty-mini-list">You have not asked any questions yet.</p>
            )}
          </div>
        )}
        {profileData.answers && miniMenuPage === "A" && (
          <div>
            <h2>Answered Questions</h2>
            {profileData.answers.length > 0 ? (
              <ul className="mini-list" >
                {profileData.answers.map(answer => (
                  <div className="mini-item" key={answer._id} >
                    <li onClick={()=>{changeActive("NewAnswer")}} >{answer.title}</li>
                    <button className="delete-button" >Delete</button>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="empty-mini-list">You have not answered any questions yet.</p>
            )}
          </div>
        )}
        {profileData.tags && miniMenuPage === "T" && (
          <div>
            <h2>Created Tags</h2>
            {profileData.tags.length > 0 ? (
              <ul className="mini-list">
                {profileData.tags.map(tag => (
                  <div className="mini-item" key={tag._id} >
                    <li>{tag.name}</li>
                    <button className="delete-button" >Delete</button>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="empty-mini-list">You have not created any tags yet.</p>
            )}
          </div>
        )}
        </div>
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
    const { username, date, reputation, questions, answers, tags } = response2.data;
    const formattedDate = formatTime(date);
    return [username, formattedDate, reputation, questions, answers, tags];
  }
  catch(error) {
    console.error('Error getting user profile:', error);
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