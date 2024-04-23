import '../stylesheets/App.css';
import React, { useEffect } from 'react';
export default function Menu(props) {
  const activePage = props.activePage;
  // change background color of the menu links based on what page is active
  useEffect(() => {
    const menuQuestions = document.getElementById("menu-questions");
    const menuTags = document.getElementById("menu-tags");
    // normal questions page === "Questions"
    // using the filter buttons === "QuestionsFiltered"
    if(activePage.includes("Questions") || activePage === "Search") {
      menuQuestions.style.backgroundColor = "rgb(219, 219, 219)";
      menuTags.style.backgroundColor = "white";
    }
    else if(activePage === "Tags") {
      menuQuestions.style.backgroundColor = "white";
      menuTags.style.backgroundColor = "rgb(219, 219, 219)";
    }
    else {
      menuQuestions.style.backgroundColor = "white";
      menuTags.style.backgroundColor = "white";
    }
  }, [activePage]);

  return (
    <div id="menu">
      <ul>
        <li>
          <button id="menu-questions" className="menu-link" onClick={() => props.changeActive("Questions")}>
            Questions
          </button>
        </li>
        <li>
          <button id="menu-tags" className="menu-link" onClick={() => props.changeActive("Tags")}>
            Tags
          </button>
        </li>
      </ul>
    </div>
  );
}