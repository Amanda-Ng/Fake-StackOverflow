import '../stylesheets/PopUps.css';
import { useState } from 'react';
import axios from 'axios';

export default function Modal(props) {
  // modalType will either be a Tag or a string "delete"
  const modalType = props.modalType;
  const onClose = props.onClose;
  const [tagName, setTagName] = useState(modalType !== "delete" ? modalType.name : "delete");

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:8000/editTag', {
          tagId: modalType._id,
          newTagName: tagName
      }, {
          headers: {
              'Content-Type': 'application/json'
          }
      });
    } catch (error) {
        console.error('Error editing tag:', error);
    }
    props.fillProfileData();
    onClose();
  };

  const handleChange = (event) => {
    setTagName(event.target.value);
  };
  return (
    <div className="modal">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <input type="text" value={tagName} onChange={handleChange} />
          <button type="submit">Submit</button>
        </form>
        <button className="cancel-button" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}