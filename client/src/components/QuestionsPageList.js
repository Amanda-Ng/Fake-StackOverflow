import '../stylesheets/App.css';
import React, { useState } from 'react';
import Question from './Question.js';

export default function QuestionsPageList(props) {
  const qList = props.qList;
  const changeActive = props.changeActive;

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const indexOfLastAnswer = currentPage * questionsPerPage;
  const indexOfFirstAnswer = indexOfLastAnswer - questionsPerPage;
  const currentQList = qList.slice(indexOfFirstAnswer, indexOfLastAnswer);
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  function formatQuestions(list) {
    // parentheses with arrow function implicitly return each mapped component
    const formattedQList = list.map(qData => (
      <Question key={qData._id} qData={qData} changeActive={changeActive} />
    ));
    return formattedQList;
  }

  const formattedQList = formatQuestions(currentQList);
  // replace questions list with this message if the questions list is empty
  const noQuestionsFound = <h2 style={{marginLeft: '40px'}}>No questions found</h2>;

  return (
    <div>
    <div id="question-list-container">{formattedQList.length === 0 ? noQuestionsFound: formattedQList}</div>
    <div className="ans-pagination">
    <button
      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
      disabled={currentPage === 1}
    >
      Prev
    </button>
    <button
      onClick={() => paginate(
        currentPage === Math.ceil(qList.length / questionsPerPage) ? 1 : currentPage + 1)}
    >
      Next
    </button>
  </div>  
  </div>
  );
}
