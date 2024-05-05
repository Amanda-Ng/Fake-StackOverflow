import '../stylesheets/App.css';
import '../stylesheets/UserProfile.css';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Modal from './Modal';
import Notification from './Notification';

export default function UserProfile(props) {
  const changeActive = props.changeActive;
  const [profileData, setProfileData] = useState(null);
  const [miniMenuPage, setMiniMenuPage] = useState("Q");
  const [modalType, setModalType] = useState("");
  const [modalTag, setModalTag] = useState(null);

  // for showing notifications about incorrect 
  const [notif, setNotif] = useState("");
  const closeNotif = () => {
    setNotif("");
  }

  // change what is shown based on mini menu
  const handleMenuClick = (page) => {
    setMiniMenuPage(page);
  }
  useMiniMenuHighlight(miniMenuPage);

  const closeModal = () => {
    setModalType("");
  }

  // put all the data retrieved into profileData
  const fillProfileData = async () => {
    retrieveProfileData()
    .then(data => {
      setProfileData({
        userId: data[0],
        username: data[1],
        date: data[2],
        reputation: data[3],
        questions: data[4],
        answeredQuestions: data[5],
        tags: data[6]
      });
    })
    .catch(error => {
      console.error('Error retrieving profile data:', error);
    });
  }
  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    fillProfileData();
  }, []);

  // delete a question and refresh the data
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
    fillProfileData();
  }
  
  // delete a answer and refresh the data
  const deleteAnswer = async (answeredQId) => {
    try {
      await axios.post("http://localhost:8000/deleteAnswer", { 
        userId: profileData.userId,  
        answeredQId: answeredQId
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    catch(error) {
      console.error('Error deleting answer:', error);
    }
    // // to refresh the data shown after an answer is deleted
    fillProfileData();
  }
  // added edit and delete buttons for tags and their handler
  const handleTagButtons = async (tag, mType) => {
    try {
      const response = await axios.post("http://localhost:8000/verifyEditableTag", { 
        userId: profileData.userId,
        tagId: tag._id,
        tagCount: tag.tagCount
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if(response.data.editable) {
        setModalType(mType);
        setModalTag(tag);
      }
      else {
        setNotif(`Cannot edit/delete "${tag.name}" tag. It is currently in use by other users.`);
      }
    }
    catch(error) {
      console.error('Error editing tag:', error);
    }
  }

  return (
    <>
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
        {profileData.answeredQuestions && miniMenuPage === "A" && (
          <div>
            <h2>Answered Questions</h2>
            {profileData.answeredQuestions.length > 0 ? (
              <ul className="mini-list" >
                {profileData.answeredQuestions.map(answeredQ => (
                  <div className="mini-item" key={answeredQ._id} >
                    <li onClick={()=>{changeActive("NewAnswer")}} >{answeredQ.title}</li>
                    <button className="delete-button" onClick={() => {deleteAnswer(answeredQ._id)}} >Delete</button>
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
              <div id="profile-tags-container">
                {profileData.tags.map(tag => (
                  <div key={tag._id} className="profile-tag-box" >
                    <p className="profile-tag-box-link">{tag.name}</p>
                    <p className="profile-tag-box-count">{tag.tagCount} questions</p>
                    <button className="edit-button" onClick={() => {handleTagButtons(tag, "edit-tag")}} >
                      Edit
                    </button>
                    <button className="delete-button" onClick={() => {handleTagButtons(tag, "delete-tag")}} >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-mini-list">You have not created any tags yet.</p>
            )}
          </div>
        )}
        </div>
        </>
      )}
      {modalType && <Modal modalType={modalType} modalTag={modalTag} fillProfileData={fillProfileData} onClose={closeModal}/>}
    </div>
    {notif && <Notification message={notif} onClose={closeNotif} />}
    </>
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
    const { username, date, reputation, questions, answeredQuestions, tags } = response2.data;
    const formattedDate = formatTime(date);
    return [userId, username, formattedDate, reputation, questions, answeredQuestions, tags];
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
function useMiniMenuHighlight(miniMenuPage) {
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
}