import React, { useState, useEffect } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";
import AskQuestion from "./AskQuestion.jsx";
import AnswerForm from "./AnswerForm.jsx";
import AnswerPage from "./AnswerPage.jsx";

function Questions({ model, updateModel, activeComponent }) {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeView, setActiveView] = useState("defaultView");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isFilter, setIsFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 5;

  const nextPage = () => {
    setCurrentPage(
      (prevPage) =>
        (prevPage + 1) % Math.ceil(questions.length / questionsPerPage)
    );
  };

  const prevPage = () => {
    setCurrentPage(
      (prevPage) =>
        (prevPage - 1 + Math.ceil(questions.length / questionsPerPage)) %
        Math.ceil(questions.length / questionsPerPage)
    );
  };

  const handleQuestionClick = async (qid) => {
    try {
      const response = await fetch(
        "http://localhost:8000/questions/incrementViews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qid }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSelectedQuestion({ ...data.question });
        setActiveView("viewQuestion");
        updateModel();
      } else {
        console.error("Failed to increment views:", data.message);
      }
    } catch (error) {
      console.error("Error handling question click:", error);
    }
  };

  useEffect(() => {
    if (activeComponent === "questions") {
      setActiveView("defaultView");
      setSelectedQuestion(null);
      setIsFilter(false);
    }
  }, [activeComponent]);

  useEffect(() => {
    const sortQuestionsNewest = (questions) => {
      return questions.sort((a, b) => {
        const dateA = new Date(a.ask_date_time);
        const dateB = new Date(b.ask_date_time);
        return dateB - dateA; // Sort descending by date
      });
    };

    if (model.questions) {
      const sortedQuestions = sortQuestionsNewest(model.questions);
      setQuestions(sortedQuestions);
      setFilteredQuestions(sortedQuestions);
    }
    // setQuestions(model.questions);
    // setFilteredQuestions(model.questions);
  }, [model.questions]);

  const renderView = () => {
    switch (activeView) {
      case "defaultView":
        return renderDefaultView();

      case "askQuestion":
        console.log("Answers page");
        return (
          <AskQuestion
            model={model}
            updateModel={updateModel}
            onQuestionPosted={() => {
              setQuestions([...model.questions]);
              setActiveView("defaultView");
            }}
          />
        );
      case "answerQuestion":
        return (
          <AnswerForm
            model={model}
            updateModel={updateModel}
            selectedQuestion={selectedQuestion}
            onAnswerPosted={(new_model) => {
              const updatedQuestions = new_model.questions;
              setQuestions(updatedQuestions);
              setActiveView("viewQuestion");
            }}
          />
        );
      case "viewQuestion":
        return (
          <AnswerPage
            model={model}
            selectedQuestion={selectedQuestion}
            onAnswerPosted={() => {
              setActiveView("defaultView");
            }}
            setActiveView={setActiveView}
            updateModel={updateModel}
          />
        );

      default:
        return renderDefaultView();
    }
  };

  function calculate(date) {
    const datePosted = new Date(date);
    const now = new Date();
    const diff = now - datePosted;
    return diff;
  }

  function findDate(askDate) {
    const datePosted = new Date(askDate);
    const now = new Date();
    const oneMinute = 60 * 1000;
    const oneDay = 24 * 60 * 60 * 1000;
    const oneYear = 365 * oneDay;

    const diff = now - datePosted;
    if (diff < oneMinute) {
      const seconds = Math.floor(diff / 1000);
      return `${seconds} seconds ago`;
    } else if (diff < oneDay) {
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

  function renderNewestView() {
    console.log("inhere");
    let updatedQuestions = [];
    let questionTimePairs = [];

    for (let question of questions) {
      let calculatedTimePeriod = calculate(question.ask_date_time);
      questionTimePairs.push({ q: question, timePeriod: calculatedTimePeriod });
    }

    questionTimePairs.sort((a, b) => a.timePeriod - b.timePeriod);

    for (let i = 0; i < questionTimePairs.length; i++) {
      updatedQuestions.push(questionTimePairs[i].q);
    }

    setQuestions(updatedQuestions);
    setIsFilter(false);

    console.log("Updated questions in Newest View:", updatedQuestions);
  }

  function renderActiveView() {
    let updatedQuestions = [];
    let questionTimePairs = [];

    for (let question of questions) {
      let answerPairs = [];
      for (let i = 0; i < question.answers.length; i++) {
        //console.log(question.text +" "+question.answers.length);
        for (let answer of model.answers) {
          if (answer._id === question.answers[i]) {
            let calculatedTimePeriod = calculate(answer.ans_date_time);
            answerPairs.push(calculatedTimePeriod);
            break;
          }
        }
      }

      answerPairs.sort((a, b) => a.timePeriod - b.timePeriod);

      if (question.answers.length === 0) answerPairs[0] = Number.MAX_VALUE;

      questionTimePairs.push({
        q: question,
        timePeriod: answerPairs[answerPairs.length - 1],
      });
    }
    if (questionTimePairs.length > 1)
      questionTimePairs.sort((a, b) => a.timePeriod - b.timePeriod);

    for (let i = 0; i < questionTimePairs.length; i++) {
      updatedQuestions.push(questionTimePairs[i].q);
    }

    console.log(updatedQuestions);
    setQuestions(updatedQuestions);
    setIsFilter(false);
  }

  function renderUnansweredView() {
    let updatedQuestions = [];
    let questionTimePairs = [];
    console.log(model);

    for (let question of questions) {
      console.log(question.answers.length);
      if (question.answers.length === 0) {
        let calculatedTimePeriod = calculate(question.ask_date_time);
        questionTimePairs.push({
          q: question,
          timePeriod: calculatedTimePeriod,
        });
      }
    }
    console.log(questionTimePairs);

    questionTimePairs.sort((a, b) => a.timePeriod - b.timePeriod);

    if (questionTimePairs.length >= 1)
      for (let i = 0; i < questionTimePairs.length; i++) {
        updatedQuestions.push(questionTimePairs[i].q);
      }

    console.log(updatedQuestions);

    setFilteredQuestions(updatedQuestions);
    setIsFilter(true);
  }

  const renderDefaultView = () => {
    const startIndex = currentPage * questionsPerPage;
    const totalQuestions = isFilter ? filteredQuestions : questions;
    const currentQuestions = totalQuestions.slice(
      startIndex,
      startIndex + questionsPerPage
    );
    const totalPages = Math.ceil(totalQuestions.length / questionsPerPage);

    const nextPage = () => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const prevPage = () => {
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    return (
      <div>
        <div id="firstRow">
          <div id="left">
            <h2>All Questions</h2>
          </div>
          <div id="right">
            <button id="aq_button" onClick={() => setActiveView("askQuestion")}>
              Ask Question
            </button>
          </div>
        </div>
        <div id="secondRow">
          <div id="left">
            <h3>
              {totalQuestions.length}{" "}
              {currentQuestions.length === 1 ? "question" : "questions"}
            </h3>
          </div>
          <div id="right">
            <button
              type="button"
              id="newestButton"
              onClick={() => renderNewestView()}
            >
              Newest
            </button>
            <button
              type="button"
              id="activeButton"
              onClick={() => renderActiveView()}
            >
              Active
            </button>
            <button
              type="button"
              id="unansweredButton"
              onClick={() => renderUnansweredView()}
            >
              Unanswered
            </button>
          </div>
        </div>
        <div id="questionsList">
          {currentQuestions.map((question) => (
            <div
              key={question._id}
              className="question"
              onClick={() => handleQuestionClick(question._id)}
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
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  };

  return <div>{renderView()}</div>;
}

export default Questions;
