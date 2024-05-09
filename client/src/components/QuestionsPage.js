import '../stylesheets/App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuestionsPageHeader from './QuestionsPageHeader.js';
import QuestionsPageList from './QuestionsPageList.js';

export default function QuestionsPage(props) {
  const activePage = props.activePage;
  const changeActive = props.changeActive;

  // rawQList contains the raw questions array from the GET request
  const [rawQList, setRawQList] = useState([]);
  // qList contains the filtered version of rawQList
  // will be written to by child component QuestionsPageHeader and read by QuestionsPageList
  const [qList, setQList] = useState([]);
  // loaded states check if GET request was fulfilled
  // used to prevent passing undefined rawQList to children components
  const [qLoaded, setQLoaded] = useState("");
  
  useEffect( () => {
    axios.get('http://localhost:8000/questions')
    .then(questionResponse => {
      setRawQList(questionResponse.data);
      setQLoaded("loaded");
    })
    .catch(questionsError => {
      console.error('Error fetching questions:', questionsError);
      setQLoaded("");
    });
  },[]); 
  // needed for the initial value of qList
  if(qLoaded === "loaded") {
    setQList(rawQList);
    setQLoaded("initialized");
  }
   
  const searchString = props.searchString.trim();
  // QuestionsPage rerenders everytime the menu-questions button is clicked
  useEffect(() => {
    // will not override qList outputted by the filter buttons
    if(activePage === "Questions") {
      setQList(rawQList);
    }
    // only executes search if there is a change in string being searched
    // wrap in useEffect to prevent infinite re-rendering
    if(activePage === "Search") {
      setQList(search(searchString, rawQList));
    }
  },[activePage, rawQList, searchString]);

  return (
    <>
      {qLoaded && <QuestionsPageHeader rawQList={rawQList} activePage={activePage} qList={qList} setQList={setQList} changeActive={changeActive} />}
      {qLoaded && <QuestionsPageList qList={qList} changeActive={changeActive} />}
    </>
  );
}

function search(string, rawQList) {
  string = string.toLowerCase();
  const tagPattern = /\[[^\]]*\]/;
  // need to be Sets to easily prevent duplicates
  const searchedTags = new Set();
  const searchedTerms = new Set();
  const result = new Set();
  // extract terms and tags from the string being searched
  for(const str of string.split(' ')) {
    if(tagPattern.test(str)) {
      searchedTags.add(str.slice(1,-1));
    }
    else {
      searchedTerms.add(str);
    }
  }
  const listFromTerms = searchByTerms(rawQList, searchedTerms);
  listFromTerms.forEach(item => {
    result.add(item);
  });
  const listFromTags = searchByTags(rawQList, [...searchedTags]);
  listFromTags.forEach(item => {
    result.add(item);
  });
  // return as an array
  return [...result];
}
function searchByTags(rawQList, searchedTags) {
  // for each question, if any of its tags is in searchedTags, then add it
  const result = rawQList.filter(q => {
    return q.tags.some(tag => searchedTags.includes(tag.name));
  });
  return result;
}
function searchByTerms(rawQList, searchedTerms) {
  const result = [];
  for(const q of rawQList) {
    for(const term of searchedTerms) {
      if(q.title.toLowerCase().includes(term) || q.text.toLowerCase().includes(term)) {
        result.push(q);
        break; // break to prevent duplicates
      }
    }
  }
  return result;
}