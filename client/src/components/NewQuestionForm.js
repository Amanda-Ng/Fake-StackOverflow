import '../stylesheets/App.css';
import React, { useState } from 'react';
import axios from 'axios';

export default function NewQuestionForm(props) {
    const [formData, setFormData] = useState({
        questionTitle: '',
        questionText: '',
        questionTags: '',
        questionUsername: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { questionTitle, questionText, questionTags, questionUsername } = formData;

        if (validateQuestionForm(questionTitle, questionText, questionTags, questionUsername)) {
            try {
                await axios.post('http://localhost:8000/questions', {
                    title: questionTitle,
                    text: questionText,
                    tags: removeDuplicates(questionTags.toLowerCase().trim().split(/\s+/)),
                    username: questionUsername
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });                
                setFormData({
                    questionTitle: '',
                    questionText: '',
                    questionTags: '',
                    questionUsername: ''
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
                <label htmlFor="qTags" className="form-header">Tags*</label><br />
                <i className="form-instructions">Add keywords separated by whitespace</i><br />
                <input type="text" id="qTags" name="questionTags" value={formData.questionTags} onChange={handleChange} /><br /><br />
                <label htmlFor="qUsername" className="form-header">Username*</label><br />
                <input type="text" id="qUsername" name="questionUsername" value={formData.questionUsername} onChange={handleChange} required /><br /><br />
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

function validateQuestionForm(title, text, tags, username) {
    // regex matches (non-alphanumeric non-whitespace non-hyphen) || (more than 5 whitespace delimited terms) || (more than 20 characters per term)
    const tagsPattern = /[^\w\s-]|((?:\S+\s+){5,}\S+$)|\S{21,}/;
    // joins unique tags in tags and trim leading/trailing whitespace
    const uniqueTags = removeDuplicates(tags.trim().toLowerCase().split(/\s+/)).join(' ');

    if (title.length > 100) {
        alert("Question title should be 100 characters or less.");
        return false;
    }
    // true if any of the regex groups match and executes if block
    if (tagsPattern.test(uniqueTags)) {
        alert("Tags should be whitespace-separated, consisting of alphanumerics or hyphenated words. There should be 5 or less tags, and each 20 characters or less.");
        return false;
    }
    if (title.trim() === '' || text.trim() === '' || tags.trim() === '' || username.trim() === '') {
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