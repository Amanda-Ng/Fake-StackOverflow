import '../stylesheets/App.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function UserProfile() {
  const [date, setDate] = useState(null);

  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    retrieveProfileData()
    .then(profileData => {
      console.table(profileData); // for testing
      const date = profileData[0];
      setDate(date);
    })
    .catch(error => {
      console.error('Error retrieving profile data:', error);
    });
  }, []);
  return (
    <div id="user-profile">
        profile
        <p>Member for {date}</p>
    </div>
  );
}
async function retrieveProfileData() {
  try {
    const response1 = await axios.get("http://localhost:8000/getLoggedIn");
    const userId = response1.data.userId;
    console.log(userId);
    const response2 = await axios.post("http://localhost:8000/userProfile", {
      userId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const date = formatTime(response2.data.date);
    return [date, userId];
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
    if(diffInDays === 0) { return " today"; }
    return ` ${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
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