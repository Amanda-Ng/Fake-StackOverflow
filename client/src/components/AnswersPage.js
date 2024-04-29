import '../stylesheets/App.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CommentsList from './CommentsList.js';

export default function AnswersPage(props) {
    const [question, setQuestion] = useState({
        title: '',
        text: '',
        tags: [],
        answers: [], 
        asked_by: 'Anonymous',
        ask_date_time: Date.now,
        views: 0,
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
      const sortedAnswers = question.answers.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

    // Pagination
    const indexOfLastAnswer = currentPage * answersPerPage;
    const indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
    const currentAnswers = sortedAnswers.slice(indexOfFirstAnswer, indexOfLastAnswer);
    console.log(currentAnswers);
    const paginate = (pageNumber) => {
      setCurrentPage(pageNumber);
    };

  return (
    <>
      <div id="answers-container">
        <div className="qAnsInfo">
          <h3 className="qAnsCount">{answers.length} answers</h3>
          <h3>{question.title}</h3>
          <button className="ask-btn" id="newQuestion" onClick={() => props.changeActive("NewQuestion")}>Ask Question</button>
          <h3 className="qAnsViews">{question.views} views</h3>
          <p dangerouslySetInnerHTML={renderHyperlinks(question.text)}></p>
          <span className="qAnsMeta">
            <span className="qAnsUser">{question.asked_by}</span>
            <div>asked {formatTime(question.ask_date_time)}</div>
          </span>
        </div>
        <div className="answers-list">
          {currentAnswers.map(answer => (
            <div className="ansAndComments">
            <div key={answer._id} className="qAnsStyle">
              <p className="ansTextStyle" dangerouslySetInnerHTML={renderHyperlinks(answer.text)}></p>
              <div>
                <div className="aUser">{answer.ans_by}</div>
                <div> answered {formatTime(answer.ans_date_time)}</div>
              </div>
            </div>
            {answer.comments && (
                <div className="comments-container" style={{ display: 'block' }}>
                  <CommentsList comments={answer.comments} aid={answer._id}/>
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