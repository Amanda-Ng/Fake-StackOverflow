import '../stylesheets/PopUps.css';
import { useState } from 'react';
import axios from 'axios';
import Notification from './Notification';

export default function Modal(props) {
  // modalType will be a string: "edit-tag" / "delete-tag" / "delete-user"
  const modalType = props.modalType;
  const modalTag = props.modalTag;
  const onClose = props.onClose;
  // if modalTag is not null, (i.e. when editing or deleting a tag) tagName will be initialized
  const [tagName, setTagName] = useState(modalTag ? modalTag.name : "");
  const [deleteInput, setDeleteInput] = useState("");

  // for showing notifications about incorrect inputs
  const [notif, setNotif] = useState("");
  const closeNotif = () => {
    setNotif("");
  }

  const handleEditTagSubmit = async (event) => {
    event.preventDefault();
    // regex matches (non-alphanumeric non-whitespace non-hyphen) || (more than 5 whitespace delimited terms) || (more than 20 characters per term)
    const tagsPattern = /[^\w\s-]|((?:\S+\s+){5,}\S+$)|\S{21,}/;
    // due to asynchronicity, tagName will not be trimmed before being passed to the POST request
    // use a variable instead
    const trimmedTagName = tagName.trim();
    setTagName(trimmedTagName);
    if(tagsPattern.test(trimmedTagName)) {
      setNotif("Invalid tag name");
      return;
    }
    try {
      await axios.post('http://localhost:8000/editTag', {
          tagId: modalTag._id,
          newTagName: trimmedTagName
      }, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    } catch (error) {
        console.error('Error editing tag:', error);
    }
    // to refresh the data shown after a tag is edited
    props.fillProfileData();
    onClose();
  };

  const handleEditTagChange = (event) => {
    setTagName(event.target.value);
  };

  const handleDeleteTagSubmit = async (event) => {
    event.preventDefault();
    if(deleteInput !== "delete") {
      setNotif("Incorrect input");
      return;
    }
    try {
      await axios.post('http://localhost:8000/deleteTag', {
          tagId: modalTag._id
      }, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    } catch (error) {
        console.error('Error deleting tag:', error);
    }
    // to refresh the data shown after a tag is deleted
    props.fillProfileData();
    onClose();
  }
  const handleDeleteTagChange = (event) => {
    setDeleteInput(event.target.value.toLowerCase());
  };
  return (
    <>
    <div className="modal">
      <div className="modal-content">
        {modalType === "edit-tag" && 
          <>
          <h3>Edit tag</h3>
          <p>A tag must consist of alphanumerics or hyphenated words and be 20 characters or less.</p>
          <p>Enter a new tag name below.</p>
          <form onSubmit={handleEditTagSubmit}>
            <input type="text" value={tagName} onChange={handleEditTagChange} />
            <button type="submit">Save</button>
          </form>
          </>
        }
        {modalType === "delete-tag" &&
          <>
          <h3>Delete tag</h3>
          <p>Are you sure you want to delete your "{tagName}" tag?</p>
          <p>If yes, type <b>delete</b></p>
          <form onSubmit={handleDeleteTagSubmit}>
            <input type="text" onChange={handleDeleteTagChange} />
            <button type="submit">Save</button>
          </form>
          </>
        }
        <button className="cancel-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
    {notif && <Notification message={notif} onClose={closeNotif} />}
    </>
  );
}