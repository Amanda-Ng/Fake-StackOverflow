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

  const handleEditTagSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:8000/editTag', {
          tagId: modalTag._id,
          newTagName: tagName
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
      // TODO: add a proper notification
      console.log("cant spell!");
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
    <div className="modal">
      <div className="modal-content">
        {modalType === "edit-tag" && 
          <form onSubmit={handleEditTagSubmit}>
            <input type="text" value={tagName} onChange={handleEditTagChange} />
            <button type="submit">Save</button>
          </form>
        }
        {modalType === "delete-tag" &&
          <>
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
  );
}