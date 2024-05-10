import '../stylesheets/App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TagsPage(props) {
    const [tags, setTags] = useState([]);
    const [tagCounts, setTagCounts] = useState([]);

    useEffect(() => {
        // Fetch tags data
        axios.get('http://localhost:8000/tags')
            .then(tagResponse => {
                setTags(tagResponse.data);
                // Fetch questions data
                axios.get('http://localhost:8000/questions')
                    .then(questionResponse => {
                        // Assuming countTagUsage accepts both questions and tags data
                        setTagCounts(countTagUsage(questionResponse.data, tagResponse.data));
                    })
                    .catch(questionsError => {
                        console.error('Error fetching questions:', questionsError);
                    });
            })
            .catch(tagError => {
                console.error('Error fetching tags:', tagError);
            });
    }, []);    

    // TOOD: use axios to get tag count instead
    function countTagUsage(questions) {
        const tagCounts = {};
        questions.forEach(question => {
          question.tags.forEach(tag => {
            const tagId = tag._id;
            tagCounts[tagId] = (tagCounts[tagId] || 0) + 1;
          });
        });
        return tagCounts;
      }      

    const handleSearch = props.handleSearch;
    const changeActive = props.changeActive;

    return (
        <div id="tags">
            <div id="tags-header">
                <div id="num-tags">{tags.length} Tags</div>
                <h2>All Tags</h2>
                <button id="tags-ask-btn" className="ask-btn" onClick={() => changeActive("NewQuestion")}>Ask Question</button>
            </div>
            <div id="tags-container">
                {tags.map(tag => (
                    <div key={tag._id} className="tag-box" onClick={() => {handleSearch(`[${tag.name}]`); changeActive("Search"); }}>
                        <p className="tag-box-link">{tag.name}</p><p>{tagCounts[tag._id]} questions</p>
                    </div>
                ))}
            </div>
        </div>
    );
}