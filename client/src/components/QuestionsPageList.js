import '../stylesheets/App.css';
import Question from './Question.js';

export default function QuestionsPageList(props) {
  const formattedQList = formatQuestions(props);
  // replace questions list with this message if the questions list is empty
  const noQuestionsFound = <h2 style={{marginLeft: '40px'}}>No questions found</h2>;
  return (
    <div id="question-list-container">{formattedQList.length === 0 ? noQuestionsFound: formattedQList}</div>
  );
}

function formatQuestions(props) {
  // parentheses with arrow function implicitly return each mapped component
  const formattedQList = props.qList.map(qData => (
    <Question key={qData._id} qData={qData} changeActive={props.changeActive} />
  ));
  return formattedQList;
}