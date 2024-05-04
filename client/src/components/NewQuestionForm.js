import '../stylesheets/App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function NewQuestionForm(props) {
    const [formData, setFormData] = useState({
        questionTitle: '',
        questionText: '',
        questionSummary: '',
        questionTags: '',
    });

    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const checkLoggedInStatus = async () => {
          try {
            const response = await axios.get('http://localhost:8000/getLoggedIn');
            if (response.data.loggedIn) {
              setLoggedIn(true);
              setUserId(response.data.userId);
            }
          } catch (error) {
            console.error('Error checking logged-in status:', error);
          }
        };
    
        checkLoggedInStatus();
      }, []);
    
      useEffect(() => {
        const fetchUserProfile = async () => {
          if (loggedIn && userId) {
            try {
              const response = await axios.post('http://localhost:8000/userProfile', { userId });
              setUsername(response.data.username);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
          }
        };
    
        fetchUserProfile();
      }, [loggedIn, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { questionTitle, questionText, questionSummary, questionTags } = formData;

        if (validateQuestionForm(questionTitle, questionText, questionSummary, questionTags)) {
            try {
                await axios.post('http://localhost:8000/questions', {
                    title: questionTitle,
                    text: questionText,
                    summary: questionSummary,
                    tags: removeDuplicates(questionTags.toLowerCase().trim().split(/\s+/)),
                    username: username,
                    userId: userId
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });                
                setFormData({
                    questionTitle: '',
                    questionText: '',
                    questionSummary: '',
                    questionTags: '',
                });
                props.changeActive("Questions");
            } catch (error) {
                console.error('Error adding question:', error);
            }
        }
    };

    return (
        <div id="new-question">
            <form onSubmit={handleSubmit} id="post-question-form">
                <br /><br /><br /><br /><br />
                <label htmlFor="qTitle" className="form-header">Question Title*</label><br />
                <i className="form-instructions">Limit to 100 characters or less</i><br />
                <input type="text" id="qTitle" name="questionTitle" maxLength="100" value={formData.questionTitle} onChange={handleChange} required /><br /><br />
                <label htmlFor="qText" className="form-header" required>Question Text*</label><br />
                <i className="form-instructions">Add details</i><br />
                <textarea id="qText" name="questionText" value={formData.questionText} onChange={handleChange} required></textarea><br /><br />
                <label htmlFor="qSummary" className="form-header" required>Question Summary*</label><br />
                <i className="form-instructions">Add a summary</i><br />
                <textarea id="qSummary" name="questionSummary" value={formData.questionSummary} onChange={handleChange} required></textarea><br /><br />
                <label htmlFor="qTags" className="form-header">Tags*</label><br />
                <i className="form-instructions">Add keywords separated by whitespace</i><br />
                <input type="text" id="qTags" name="questionTags" value={formData.questionTags} onChange={handleChange} /><br /><br />
                <input type="submit" value="Post Question" id="post-btn" />
                <p id="mandatory">* indicates mandatory fields</p>
            </form>
        </div>
    );
}

function removeDuplicates(arr) {
    let unique = [];
    arr.forEach(element => {
        if (!unique.includes(element)) {
            unique.push(element);
        }
    });
    return unique;
}

function validateQuestionForm(title, text, summary, tags) {
    // regex matches (non-alphanumeric non-whitespace non-hyphen) || (more than 5 whitespace delimited terms) || (more than 20 characters per term)
    const tagsPattern = /[^\w\s-]|((?:\S+\s+){5,}\S+$)|\S{21,}/;
    // joins unique tags in tags and trim leading/trailing whitespace
    const uniqueTags = removeDuplicates(tags.trim().toLowerCase().split(/\s+/)).join(' ');

    if (title.length > 50) {
        alert("Question title should be 50 characters or less.");
        return false;
    }

    if (summary.length > 140) {
        alert("Question summary should be 140 characters or less.");
        return false;
    }

    // TODO: add reputation constraint
    // true if any of the regex groups match and executes if block
    if (tagsPattern.test(uniqueTags)) {
        alert("Tags should be whitespace-separated, consisting of alphanumerics or hyphenated words. There should be 5 or less tags, and each 20 characters or less.");
        return false;
    }
    if (title.trim() === '' || text.trim() === '' || summary.trim() === '' || tags.trim() === '') {
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