import '../stylesheets/App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ACommentsList from './ACommentsList.js';
import QCommentsList from './QCommentsList.js';

export default function AnswersPage(props) {
    const [question, setQuestion] = useState({
        title: '',
        text: '',
        tags: [],
        answers: [], 
        asked_by: 'Anonymous',
        ask_date_time: Date.now,
        views: 0,
        votes: 0
      });
  const [answers, setAnswers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const answersPerPage = 5;

  const qid = props.qid;

  useEffect(() => {
    // Function to update views count in the database
    const updateViewsCount = () => {
      axios.put(`http://localhost:8000/questions/${qid}/views`)
        .catch(error => {
          console.error('Error updating views count:', error);
        });
    };

    // Fetch question and answers from the server
    axios.get(`http://localhost:8000/questions/${qid}`)
      .then(response => {
        const updatedQuestion = { ...response.data, views: response.data.views + 1 };
        setQuestion(updatedQuestion);
        setAnswers(response.data.answers);
        updateViewsCount();
      })
      .catch(error => {
        console.error('Error fetching question and answers:', error);
      });
  }, [qid]);

      // Sort answers by descending date
      const sortedAnswers = answers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

    // Pagination
    const indexOfLastAnswer = currentPage * answersPerPage;
    const indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
    const currentAnswers = sortedAnswers.slice(indexOfFirstAnswer, indexOfLastAnswer);
    console.log(currentAnswers);
    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

    // TODO: add reputation constraint and update reputation
    const handleQUpvote = async (qId) => {
      try {
        await axios.put(`http://localhost:8000/questions/${qId}/upvote`);
  
      const response = await axios.get(`http://localhost:8000/questions/${qid}`);
      setQuestion(response.data); // Update state with fetched question
  
      props.changeActive('Answers', qid);
  
      } catch (error) {
        console.error('Error updating votes:', error);
      }
    };

    const handleQDownvote = async (qId) => {
      try {
        await axios.put(`http://localhost:8000/questions/${qId}/downvote`);
  
        const response = await axios.get(`http://localhost:8000/questions/${qid}`);
        setQuestion(response.data); // Update state with fetched question
  
      props.changeActive('Answers', qid);
  
      } catch (error) {
        console.error('Error updating votes:', error);
      }
    };

    const handleAUpvote = async (aId) => {
      try {
        await axios.put(`http://localhost:8000/answers/${aId}/upvote`);
  
        const response = await axios.get(`http://localhost:8000/questions/${qid}/answers`);
        setAnswers(response.data); // Update state with fetched answers
  
      props.changeActive('Answers', qid);
  
      } catch (error) {
        console.error('Error updating votes:', error);
      }
    };

    const handleADownvote = async (aId) => {
      try {
        await axios.put(`http://localhost:8000/answers/${aId}/downvote`);
  
        const response = await axios.get(`http://localhost:8000/questions/${qid}/answers`);
        setAnswers(response.data); // Update state with fetched answers
  
      props.changeActive('Answers', qid);
  
      } catch (error) {
        console.error('Error updating votes:', error);
      }
    };

  return (
    <>
      <div id="answers-container">
        <div className="qAnsInfo">
          <h3 className="qAnsCount">{answers.length} answers</h3>
          <h3>{question.title}</h3>
          <button className="ask-btn" id="newQuestion" onClick={() => props.changeActive("NewQuestion")}>Ask Question</button>
          <div>
            <h3 className="qAnsViews">{question.views} views</h3>
            <div className="q-vote-buttons">
              <button className="q-upvote-btn" onClick={() => handleQUpvote(qid)}>Upvote</button>
              <p className="qVotes">{question.votes}</p>
              <button className="q-downvote-btn" onClick={() => handleQDownvote(qid)}>Downvote</button>
            </div>
          </div>

          <div>
            <p dangerouslySetInnerHTML={renderHyperlinks(question.text)}></p>
            <div className="ans-page-tags">{question.tags.map(tag => (
                <span key={tag._id} className="question-tags">{tag.name}</span>
              ))}</div>
          </div>
          <span className="qAnsMeta">
            <span className="qAnsUser">{question.asked_by}</span>
            <div>asked {formatTime(question.ask_date_time)}</div>
          </span>
          
          {question.comments && (
                <div className="q-comments-container" style={{ display: 'block' }}>
                  <QCommentsList comments={question.comments} qid={question._id} changeActive={props.changeActive}/>
                </div>
            )}

        </div>
        <div className="answers-list">
          {currentAnswers.map(answer => (
            <div key={answer._id} className="ansAndComments">
            <div className="qAnsStyle">
            <div className="a-vote-buttons">
              <button className="a-upvote-btn" onClick={() => handleAUpvote(answer._id)}>Upvote</button>
              <p className="aVotes">{answer.votes}</p>
              <button className="a-downvote-btn" onClick={() => handleADownvote(answer._id)}>Downvote</button>
            </div>
              <p className="ansTextStyle" dangerouslySetInnerHTML={renderHyperlinks(answer.text)}></p>
              <div>
                <div className="aUser">{answer.ans_by}</div>
                <div> answered {formatTime(answer.ans_date_time)}</div>
              </div>
            </div>
            {answer.comments && (
                <div className="a-comments-container" style={{ display: 'block' }}>
                  <ACommentsList comments={answer.comments} qid={qid} aid={answer._id} changeActive={props.changeActive}/>
                </div>
            )}
            </div>
          ))}
        </div>
        <br />
        <div className="ans-pagination">
          <button
            onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            onClick={() => paginate(
              currentPage === Math.ceil(question.answers.length / answersPerPage) ? 1 : currentPage + 1)}
          >
            Next
          </button>
        </div>        
        <button className="answer-btn" id="newAnswer" onClick={() => props.changeActive("NewAnswer", qid)}>Answer Question</button>
      </div>
    </>
  );
}

function formatTime(date) {
    const now = new Date();
    date = new Date(date); // JSON passes everything as Strings, so convert to Date here
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    if (diff < 60) { return `${diff} seconds ago`; }
    if (diff < 3600) { return Math.floor(diff / 60) + " minutes ago"; } // less than an hour
    if (diff < 86400) { return Math.floor(diff / 3600) + " hours ago"; } // less than a day
    const month = date.toLocaleString('default', { month: 'short' }); // get shortened month name
    const day = date.getDate();
    const hour = ('0'+date.getHours()).slice(-2); // slice for leading 0s
    const minute = ('0'+date.getMinutes()).slice(-2); // slice for leading 0s
    if (diff < 31536000) { return `${month} ${day} at ${hour}:${minute}`; } // less than a year
    const year = date.getFullYear();
    return `${month} ${day}, ${year} at ${hour}:${minute}`;
  }

function renderHyperlinks(text) {
  const hyperlinkPattern = /\[([^\s]+)\]\((https?:\/\/[^\s]+)\)/g;
  return { __html: text.replace(hyperlinkPattern, '<a href="$2" target="_blank" style="color: rgb(48,144,226)">$1</a>') };
}