import '../stylesheets/App.css';

export default function QuestionsPageHeader(props) {
  const activePage = props.activePage;
  const changeActive = props.changeActive;
  const rawQList = props.rawQList;
  const qList = props.qList;
  const setQList = props.setQList;
  sortNewest(rawQList); // by default, sort by newest

  let shownListLen = qList.length;
  let title = ""; // changes if search is used
  
  // executes if searching
  if(activePage === "Search") {
    title = <h2 id="search-title">Search Results</h2>;
    sortNewest(qList);
  }
  else {
    title = <h2 id="question-title">All Questions</h2>;
  }

  // functions that the filter buttons use
  const clickNewest = () => {
    sortNewest(rawQList);
    setQList(rawQList);
    changeActive("QuestionsFiltered");
  };
  const clickActive = () => {
    const activeList = sortActive(rawQList);
    setQList(activeList);
    changeActive("QuestionsFiltered");
  };
  const clickUnanswered = () => {
    const unansweredList = showUnanswered(rawQList);
    setQList(unansweredList);
    changeActive("QuestionsFiltered");
  }
  return (
    <div className="page-header">
      {title}
      <button id="ask-btn" className="ask-btn" onClick={() => changeActive("NewQuestion")}>
        Ask Question
      </button>
      <h3 id="question-count">{shownListLen} questions</h3>
      <span className="question-button-container">
        <button id="newest-btn" className="question-btn" onClick={clickNewest}>Newest</button>
        <button id="active-btn" className="question-btn" onClick={clickActive}>Active</button>
        <button id="unanswered-btn" className="question-btn" onClick={clickUnanswered}>Unanswered</button>  
      </span>
    </div>
  );
}

function sortNewest(rawQList) {
  rawQList.sort((a,b) => {
    let bDate = new Date(b.ask_date_time);
    let aDate = new Date(a.ask_date_time);
    return bDate-aDate;
  });
}

function sortActive(rawQList) {
  const sorted = [...rawQList].sort((a,b) => {
    const aLen = a.answers.length;
    const bLen = b.answers.length;
    // check if unanswered and moves those questions to the end of the list
    if(aLen === 0 && bLen === 0) { return 0; }
    // a goes after b
    if(aLen === 0) { return 1; }
    // b goes after a
    if(bLen === 0) { return -1;  }
    // sort by most recent ansId
    const aLastAnsCount = a.answers[aLen-1].ans_date_time;
    const bLastAnsCount = b.answers[bLen-1].ans_date_time;
    // aLastAnsCount and bLastAnsCount should not have an equal case
    if(aLastAnsCount < bLastAnsCount) { return 1; }
    return -1;
  });
  return sorted;
}
function showUnanswered(rawQList) {
  let unanswered = [];
  for(const x of rawQList) {
    if(x.answers.length === 0) {
      unanswered.push(x);
    }
  }
  return unanswered;
}