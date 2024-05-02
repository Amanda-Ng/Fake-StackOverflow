// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import React, { useState } from 'react';
import NavBar from './components/NavBar.js';
import MainContent from './components/MainContent.js';

function App() {
  // for navigating between pages
  const [activePage, setActivePage] = useState("Welcome");
  //selectedQuestionId is used for showing answers to a question
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const changeActive = (name, qid = null) => {
    setActivePage(name);
    if (qid) {
      setSelectedQuestionId(qid);
    }
  };

  // passing searchString from NavBar to MainContent
  const [searchString, setSearchString] = useState('');
  const handleSearch = (data) => {
    setSearchString(data);
  } 
  return (
    <section className="fakeso">
      <NavBar 
        handleSearch={handleSearch} 
        activePage={activePage} 
        changeActive={changeActive} 
        selectedQuestionId={selectedQuestionId} 
      />
      <MainContent 
        handleSearch={handleSearch}
        searchString={searchString} 
        activePage={activePage} 
        changeActive={changeActive} 
        selectedQuestionId={selectedQuestionId} 
      />
    </section>
  );
}

export default App;