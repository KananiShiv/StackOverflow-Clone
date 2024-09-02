import React, { useState, useEffect } from "react";

let matchingQuestions = [];

function findDate(askDate) {
  const datePosted = new Date(askDate);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneYear = 365 * oneDay;

  const diff = now - datePosted;
  if (diff < oneDay) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours > 0 ? hours + " hours " : ""}${minutes} minutes ago`;
  } else if (diff < oneYear) {
    return `on ${datePosted.toLocaleString("default", {
      month: "short",
      day: "numeric",
    })} at ${datePosted.toLocaleString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  } else {
    return `on ${datePosted.toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} at ${datePosted.toLocaleString("default", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }
}

function calculate(date) {
  const datePosted = new Date(date);
  const now = new Date();

  const diff = now - datePosted;
  return diff;
}

function Validate(searchTerms, model) {
  // console.log(searchTerms);
  // console.log(model);
  matchingQuestions = [];
  for (const question of model.questions) {
    let search_arr = searchTerms.split(" ");

    let question_arr = question.title.split(" ");

    let text_arr = question.text.split(" ");

    let title_match = false;
    let text_match = false;

    for (let j = 0; j < search_arr.length; j++) {
      console.log(search_arr[j].toLowerCase());
      for (let z = 0; z < question_arr.length; z++) {
        console.log(question_arr[z].toLowerCase());
        if (
          question_arr[z].toLowerCase().includes(search_arr[j].toLowerCase())
        ) {
          title_match = true;
          break;
        }
      }
    }

    for (let j = 0; j < search_arr.length; j++) {
      for (let z = 0; z < text_arr.length; z++) {
        if (text_arr[z].toLowerCase().includes(search_arr[j].toLowerCase())) {
          text_match = true;
          break;
        }
      }
    }
    let tagMatch = false;

    for (let i = 0; i < search_arr.length && !tagMatch; i++) {
      let term = search_arr[i];
      if (term.startsWith("[") && term.endsWith("]")) {
        const tagName = term.slice(1, -1).toLowerCase();
        console.log(tagName);
        for (let j = 0; j < question.tags.length && !tagMatch; j++) {
          let questionTagId = question.tags[j];

          for (let z = 0; z < model.tags.length && !tagMatch; z++) {
            if (model.tags[z]._id === questionTagId) {
              if (tagName === model.tags[z].name.toLowerCase()) {
                tagMatch = true;
                break;
              }
            }
          }
        }
      }
    }

    if (title_match || text_match || tagMatch) {
      matchingQuestions.push(question);
    }
  }

  console.log(matchingQuestions);
  return matchingQuestions;
}

export default function SearchBar({ searchQue = "", model }) {
  const [isValid, setIsValid] = useState(false);
  const [question_arr, setQuestionArr] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isFilter, setIsFilter] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5; // Define how many questions per page

  useEffect(() => {
    let isValid = false;
    let newQuestionsArr = [];
    let newFilteredQuestions = [];

    if (searchQue.length > 0) {
      console.log("Here1243143");
      const validatedQuestions = Validate(searchQue, model);
      isValid = validatedQuestions.length > 0;
      newQuestionsArr = validatedQuestions;
      newFilteredQuestions = validatedQuestions;
    } else {
      console.log("ejknm");
    }

    newQuestionsArr = sortQuestionsByNewest(newQuestionsArr);
    setIsValid(isValid);
    setQuestionArr(newQuestionsArr);
    setFilteredQuestions(newFilteredQuestions);
    setSearchAttempted(searchQue.length > 0);
    setSearchCompleted(true);
  }, [searchQue, model]);

  let questionsToDisplay;

  questionsToDisplay = isFilter ? filteredQuestions : question_arr;

  if (isFilter) {
    questionsToDisplay = filteredQuestions;
  } else {
    questionsToDisplay = question_arr;
  }

  const startIndex = currentPage * questionsPerPage;
  const totalQuestions =  questionsToDisplay;
  const currentQuestions = totalQuestions.slice(
    startIndex,
    startIndex + questionsPerPage
  );
  const totalPages = Math.ceil(questionsToDisplay.length / questionsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  function sortQuestionsByNewest(questions) {
    return questions.sort(
      (a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time)
    );
  }

  function renderNewest() {
    console.log("inhere");
    let updatedQuestions = [];
    let questionTimePairs = [];

    for (let question of question_arr) {
      let calculatedTimePeriod = calculate(question.ask_date_time);
      questionTimePairs.push({ q: question, timePeriod: calculatedTimePeriod });
    }

    questionTimePairs.sort((a, b) => a.timePeriod - b.timePeriod);

    for (let i = 0; i < questionTimePairs.length; i++) {
      updatedQuestions.push(questionTimePairs[i].q);
    }

    setQuestionArr(updatedQuestions);
    setIsFilter(false);
  }
  function renderActive() {
    let updatedQuestions = [];
    let questionTimePairs = [];

    for (let question of question_arr) {
      let answerPairs = [];
      for (let i = 0; i < question.answers.length; i++) {
        for (let answer of model.answers) {
          if (answer._id === question.answers[i]) {
            let calculatedTimePeriod = calculate(answer.ans_date_time);
            answerPairs.push(calculatedTimePeriod);
            break;
          }
        }

        answerPairs.sort((a, b) => a.timePeriod - b.timePeriod);
      }
      if (question.answers.length === 0) answerPairs[0] = 0;

      questionTimePairs.push({ q: question, timePeriod: answerPairs[0] });
    }

    if (questionTimePairs.length > 1)
      questionTimePairs.sort((a, b) => b.timePeriod - a.timePeriod);

    for (let i = 0; i < questionTimePairs.length; i++) {
      updatedQuestions.push(questionTimePairs[i].q);
    }

    setQuestionArr(updatedQuestions);
    setIsFilter(false);
  }

  function renderUnanswered() {
    let updatedQuestions = [];
    let questionTimePairs = [];

    for (let question of question_arr) {
      if (question.answers.length === 0) {
        let calculatedTimePeriod = calculate(question.ask_date_time);
        questionTimePairs.push({
          q: question,
          timePeriod: calculatedTimePeriod,
        });
      }
    }

    questionTimePairs.sort((a, b) => a.timePeriod - b.timePeriod);

    if (questionTimePairs.length >= 1)
      for (let i = 0; i < questionTimePairs.length; i++) {
        updatedQuestions.push(questionTimePairs[i].q);
      }

    console.log(updatedQuestions);

    setFilteredQuestions(updatedQuestions);
    setIsFilter(true);
  }

  if (searchAttempted && !isValid && !isFilter && searchCompleted) {
    return (
      <div>
        <div id="firstRow">
          <div id="left">
            <h2>All Questions</h2>
          </div>
          <div id="right">
            <button id="aq_button">Ask Question</button>
          </div>
        </div>
        <div id="secondRow">
          <div id="left">
            <h3>NO Questions Found</h3>
          </div>
          <div id="right">
            <button type="button" id="newestButton" disabled>
              Newest
            </button>
            <button type="button" id="activeButton" disabled>
              Active
            </button>
            <button type="button" id="unansweredButton" disabled>
              Unanswered
            </button>
          </div>
        </div>
      </div>
    );
  }

  

  return (
    <div>
      <div id="firstRow">
        <div id="left">
          <h2>All Questions</h2>
        </div>
        <div id="right">
          <button id="aq_button">Ask Question</button>
        </div>
      </div>
      <div id="secondRow">
        <div id="left">
          <h3>
            {questionsToDisplay.length}{" "}
            {questionsToDisplay.length === 1 ? "question" : "questions"}
          </h3>
        </div>
        <div id="right">
          <button type="button" id="newestButton" onClick={renderNewest}>
            Newest
          </button>
          <button type="button" id="activeButton" onClick={renderActive}>
            Active
          </button>
          <button
            type="button"
            id="unansweredButton"
            onClick={renderUnanswered}
          >
            Unanswered
          </button>
        </div>
      </div>
      <div id="questionsList2">
        {currentQuestions.map((question) => (
          <div
            key={question._id}
            className="question"
            style={{ cursor: "pointer" }}
          >
            <div className="sub_divide">
              <div className="views_div">
                <p>{`${question.answers.length} answers ${question.views} views`}</p>
              </div>
              <div className="title_div">
                <p>{question.title}</p>
              </div>
              <div className="post_description">
                <p>
                  <span style={{ color: "red" }}>{question.asked_by}</span>{" "}
                  asked {findDate(question.ask_date_time)}
                </p>
              </div>
            </div>
            <div className="tags">
              {question.tags.map((tagId) => {
                const tag = model.tags.find((t) => t._id === tagId);
                return tag ? (
                  <span key={tagId} className="tag">
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination-buttons">
          <button onClick={prevPage} disabled={currentPage === 0}>
            Prev
          </button>
          <button onClick={nextPage} disabled={currentPage === totalPages - 1}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
