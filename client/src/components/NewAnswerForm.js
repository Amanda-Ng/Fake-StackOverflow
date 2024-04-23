import React, { useState } from 'react';
import axios from 'axios';
import '../stylesheets/App.css';

export default function NewAnswerForm(props) {
  const qid = props.qid;

  const [formData, setFormData] = useState({
    answerUsername: '',
    answerText: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const decrementViewsCount = () => {
    axios.put(`http://localhost:8000/questions/${qid}/answer/views`)
      .catch(error => {
        console.error('Error updating views count:', error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { answerUsername, answerText } = formData;

    if (validateAnswerForm(answerUsername, answerText)) {

    try {
        decrementViewsCount();
        
        // Send a POST request to add the new answer
        const response = await axios.post(`http://localhost:8000/questions/${qid}/answers`, {
          username: answerUsername,
          text: answerText,
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Check if the answer was successfully added
        if (response.status === 201) {
          // Reset the form data
          setFormData({
            answerUsername: '',
            answerText: ''
          });
          
          props.changeActive("Answers", qid);
        }
      } catch (error) {
        console.error('Error adding new answer:', error);
      }
    }
  };

  return (
    <div id="new-answer">
      <br /><br /><br />
      <form className="post-ans" onSubmit={handleSubmit}>
        <br /><br /><br />
        <label htmlFor="aUsername" id="form-header">Username*</label><br />
        <input
          type="text"
          id="aUsername"
          name="answerUsername"
          value={formData.answerUsername}
          onChange={handleChange}
          required
        /><br /><br />
        <label htmlFor="aText" id="form-header">Answer Text*</label><br />
        <textarea
          id="aText"
          name="answerText"
          value={formData.answerText}
          onChange={handleChange}
          required
        ></textarea><br /><br />
        <input type="submit" value="Post Answer" id="post-ans" />
        <p id="mandatory">* indicates mandatory fields</p>
      </form>
    </div>
  );
}

function validateAnswerForm(username, text) {
  // true if any of the regex groups match and executes if block
  if (username.trim() === '' || text.trim() === '') {
    alert("Please fill in all required fields.");
    return false;
  }

  // Check for hyperlinks in the question text
  const possibleHyperlinkPattern = /\[([^\]]*?)\]\(([^\s]*?)\)/g;
  const possibleHyperlinks = text.match(possibleHyperlinkPattern);
  if (possibleHyperlinks) {
      for (const possibleHyperlink of possibleHyperlinks) {
          const [, , link] = possibleHyperlink.match(/\[([^\]]*?)\]\(([^\s]*?)\)/);
          if (!link.startsWith('https://') && !link.startsWith('http://')) {
              alert(`The link "${link}" must start with "https://" or "http://".`);
              return false;
          }
      }
  }

  return true;
}