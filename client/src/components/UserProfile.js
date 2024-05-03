import '../stylesheets/UserProfile.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [profileData, setProfileData] = useState(null);

  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    retrieveProfileData()
    .then(data => {
      // console.log(data[2]);
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
  // console.log(profileData);
  return (
    <div id="user-profile">
      {profileData && (
        <>
        <h1 className="username">{profileData.username}</h1>
        <span className="bio">🕓&nbsp;Member for {profileData.date}</span>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <span className="bio">🏆{profileData.rep} reputation points</span>
        <div id="mini-menu">
          <ul>
            <li><button className="mini-menu-link" >Questions</button></li>
            <li><button className="mini-menu-link" >Answers</button></li>
            <li><button className="mini-menu-link" >Tags</button></li>
          </ul>
        </div>
        {profileData.questions && profileData.questions.length > 0 && (
          <div>
            <h2>Questions:</h2>
            <ul>
              {profileData.questions.map(question => (
                <li key={question._id}>{question.title}</li>
              ))}
            </ul>
          </div>
        )}
        {profileData.answers && profileData.answers.length > 0 && (
          <div>
            <h2>Answers:</h2>
            <ul>
              {profileData.answers.map(answer => (
                <li key={answer._id}>{answer.text}</li>
              ))}
            </ul>
          </div>
        )}
        {profileData.tags && profileData.tags.length > 0 && (
          <div>
            <h2>Tags:</h2>
            <ul>
              {profileData.tags.map(tag => (
                <li key={tag._id}>{tag.name}</li>
              ))}
            </ul>
          </div>
        )}
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
    const { username, date, rep, questions, answers, tags } = response2.data;
    const formattedDate = formatTime(date);
    console.log(answers);
    return [username, formattedDate, rep, questions, answers, tags];
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