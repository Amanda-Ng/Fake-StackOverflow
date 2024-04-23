import '../stylesheets/App.css';

import Menu from './Menu.js';
import QuestionsPage from './QuestionsPageHeader.js';
import TagsPage from './TagsPage.js';
import AnswersPage from './AnswersPage.js';
import NewAnswerForm from './NewAnswerForm.js';
import NewQuestionForm from './NewAnswerForm.js';

export default function MainContent(props) {
  const activePage = props.activePage;
  const changeActive = props.changeActive;
  const selectedQuestionId = props.selectedQuestionId;
  const searchString = props.searchString;
  const handleSearch = props.handleSearch;
  let pageContent;
  switch(activePage) {
    case "NewQuestion": pageContent = <NewQuestionForm changeActive={changeActive} />; break;
    case "NewAnswer": pageContent = <NewAnswerForm changeActive={changeActive} qid={selectedQuestionId} />; break;
    case "Answers": pageContent = <AnswersPage changeActive={changeActive} qid={selectedQuestionId} />; break;
    case "Tags": pageContent = <TagsPage handleSearch={handleSearch} changeActive={changeActive} />; break;
    // default is either "Questions" or "Search"
    default: pageContent = <QuestionsPage searchString={searchString} activePage={activePage} changeActive={changeActive} />; break;
  }

  return (
    <div>
      <Menu activePage={activePage} changeActive={changeActive}/>
      <div className="main-content">{pageContent}</div>
    </div>
  );
}