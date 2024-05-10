import '../stylesheets/App.css';
import '../stylesheets/UserProfile.css';
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Notification from './Notification';
import Question from './Question';

export default function UserProfile(props) {
  axios.defaults.withCredentials = true;
  const changeActive = props.changeActive;
  const handleSearch = props.handleSearch;
  const [profileData, setProfileData] = useState(null);
  const [allUsers, setAllUsers] = useState(null);
  const [miniMenuPage, setMiniMenuPage] = useState("Q");

  const [modalType, setModalType] = useState("");
  const [modalTag, setModalTag] = useState(null);
  const [modalUser, setModalUser] = useState([null, ""]);
  const [modalAnswer, setModalAnswer] = useState(["",""]);
  const [modalQuestion, setModalQuestion] = useState(null);

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
  const fillProfileData = async (newUserId) => {
    retrieveProfileData(newUserId)
    .then(data => {
      setProfileData({
        userId: data[0],
        username: data[1],
        date: data[2],
        reputation: data[3],
        questions: data[4],
        answeredQuestions: data[5],
        tags: data[6],
        isAdmin: data[7]
      });
    })
    .catch(error => {
      console.error('Error retrieving profile data:', error);
    });
  }
  // useCallback solves eslint issue with the useEffect and getAllUsers
  const getAllUsers = useCallback(async () => {
    try {
        if (profileData && profileData.isAdmin) {
            const response = await axios.get("http://localhost:8000/allUsers");
            setAllUsers(response.data.usernamesAndIds);
        } else {
            console.log("User is not an admin. Cannot fetch all users.");
        }
    } catch (error) {
        console.error('Error fetching all users:', error);
    }
  }, [profileData]);
  // runs only once using useEffect and an empty dependency array
  useEffect(() => {
    fillProfileData();
  }, []);
  // useEffect to fetch all users when profileData is updated
  useEffect(() => {
    if (profileData && profileData.isAdmin) {
        getAllUsers();
    }
  }, [profileData, getAllUsers]);
  

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
  const editQuestion = async (question) => {
    try {
      setModalQuestion(question);
      setModalType("edit-question");
    }
    catch(error) {
      console.error('Error editing question:', error);
    }
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

  const editAnswer = async (answeredQ) => {
    try {
      const response = await axios.post("http://localhost:8000/getAnswer", { 
        userId: profileData.userId,  
        answeredQ: answeredQ
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setModalAnswer([response.data.answerId, response.data.answerText]);
      setModalType("edit-answer");
    }
    catch(error) {
      console.error('Error deleting user:', error);
    }
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
      if(response.data.editable || profileData.isAdmin) {
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
  const handleDeleteUser = async (userId, username) => {
    try {
      setModalUser([userId,username]);
      setModalType("delete-user");
    }
    catch(error) {
      console.error('Error deleting user:', error);
    }
  }
  // TODO: remove this when done testing
  // const testingFunction = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:8000/testing", {withCredentials: true});
  //     console.log(res.data);
  //   }
  //   catch(error) {
  //     console.log(`ERROR: ${error}`);
  //   }
  // }

  return (
    <>
    <div id="user-profile">
      {/* TODO: remove this when done testing */}
    {/* <button onClick={testingFunction}>TESTING BUTTON1</button> */}
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
                {profileData.isAdmin && (
                  <li id="mini-u"><button className="mini-link" onClick={() => {handleMenuClick("U")}} >
                  Users
                  </button></li>
                )}
            </ul>
          </div>
        {profileData.questions && miniMenuPage === "Q" && (
          <div>
            <h2>Asked Questions</h2>
            {profileData.questions.length > 0 ? (
              <ul className="mini-list">
                {profileData.questions.map(question => (
                  <div className="mini-item" key={question._id} >
                    <li onClick={() => {editQuestion(question)}} >{question.title}</li>
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
                    <Question key={answeredQ._id} qData={answeredQ} changeActive={changeActive} />
                    <button className="edit-button" onClick={() => {editAnswer(answeredQ)}} >
                      Edit
                    </button>
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
                    <p className="profile-tag-box-link" onClick={() => {handleSearch(`[${tag.name}]`); changeActive("Search"); }}>{tag.name}</p>
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
        {allUsers && miniMenuPage === "U" && (
          <div>
            <h2>All Users</h2>
            {allUsers.length > 0 ? (
              <ul className="mini-list">
                {allUsers.map(user => (
                  <div key={user._id} className="mini-item" >
                    <li onClick={() => { fillProfileData(user.id); setMiniMenuPage("Q"); }}>{user.username}</li>
                    <button className="delete-button" onClick={() => {handleDeleteUser(user.id, user.username)}} >Delete</button>
                  </div>
                ))}
              </ul>
            ) : (
              <p className="empty-mini-list">There are no other users yet.</p>
            )}
          </div>
        )}
        </div>
        </>
      )}
      {modalType && 
      <Modal 
        modalType={modalType} 
        modalTag={modalTag} 
        modalUser={modalUser} 
        modalAnswer={modalAnswer}
        modalQuestion={modalQuestion}
        fillProfileData={fillProfileData} 
        onClose={closeModal}/>
      }
    </div>
    {notif && <Notification message={notif} onClose={closeNotif} />}
    </>
  );
}

async function getCurrentUser() {
  try {
    const response = await axios.get("http://localhost:8000/getLoggedIn");
    const userId = response.data.userId;
    return userId;
  }
  catch(error) {
    console.error('Error getting user profile:', error);
  }
}

async function retrieveProfileData(newUserId) {
  try {
    let userId;
    if(!newUserId) {
      userId = await getCurrentUser();
    }
    else {
      userId = newUserId;
    }
    
    const response2 = await axios.post("http://localhost:8000/userProfile", { userId }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const { username, date, reputation, questions, answeredQuestions, tags, isAdmin } = response2.data;
    const formattedDate = formatTime(date);
    return [userId, username, formattedDate, reputation, questions, answeredQuestions, tags, isAdmin];
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
    const miniU = document.getElementById("mini-u");
    // check miniQ, miniA, and miniA are not null
    if(miniQ && miniA && miniT) {
      miniQ.style.backgroundColor = "white";
      miniA.style.backgroundColor = "white";
      miniT.style.backgroundColor = "white";
    }
    // miniU must be set separately because it can be null if user is not an admin
    if(miniU) {
      miniU.style.backgroundColor = "white";
    }
    if(miniMenuPage === "Q" && miniQ) {
      miniQ.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else if(miniMenuPage === "A" && miniA) {
      miniA.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else if(miniMenuPage === "T" && miniT) {
      miniT.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else if(miniMenuPage === "U" && miniU) {
      miniU.style.backgroundColor = "rgb(219, 219, 219)";
    }
  }, [miniMenuPage]);
}