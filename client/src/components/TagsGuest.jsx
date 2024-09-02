import React, { useState, useEffect } from "react";
import "../stylesheets/Tags.css";
import AnswerPage from "./AnswerPage.jsx";

function Tags({ model, updateModel }) {
  const [tagNames, setTagNames] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [total, setTotal] = useState(0);
  const [activeView, setActiveView] = useState("tagsView");
  const [selectedTag, setSelectedTag] = useState("");
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  useEffect(() => {
    findTagsFrequency();
  }, [model.questions]);

  const handleTagClick = (tagName) => {
    const tag = model.tags.find((t) => t.name === tagName);
    if (!tag) return;

    const filtered = model.questions.filter((question) =>
      question.tags.includes(tag._id)
    );

    setSelectedTag(tagName);
    setFilteredQuestions(filtered);
  };
  const renderView = () => {
    switch (activeView) {
      case "tagsView":
        return (
          <>
            <div id="all_questions">
              <div className="left">
                <span>{total} Tags</span>
              </div>
              <h2 className="center">ALL TAGS</h2>
            </div>
            <div id="center_block" style={{ height: "100%", width: "100%" }}>
              {renderTags()}
            </div>
          </>
        );
      case "answerPage":
        return (
          <AnswerPage
            model={model}
            selectedQuestion={currentQuestion}
            onAnswerPosted={() => {
              findTagsFrequency();
              setActiveView("tagsView");
            }}
            setActiveView={setActiveView}
          />
        );
      default:
        return <div>Unknown view</div>;
    }
  };

  const findTagsFrequency = () => {
    const tagFrequencies = {};
    let sumOfFrequencies = 0;

    model.questions.forEach((question) => {
      question.tags.forEach((tagId) => {
        const tag = model.tags.find((t) => t._id === tagId);
        if (tag) {
          const tagName = tag.name;
          tagFrequencies[tagName] = (tagFrequencies[tagName] || 0) + 1;
        }
      });
    });

    const localTagNames = Object.keys(tagFrequencies);
    const localFrequencies = Object.values(tagFrequencies);

    sumOfFrequencies = localFrequencies.reduce((acc, curr) => acc + curr, 0);

    setTagNames(localTagNames);
    setFrequencies(localFrequencies);
    setTotal(sumOfFrequencies);
  };

  const handleQuestionClick = (question) => {
    console.log(question); 
    setCurrentQuestion(question);
    setActiveView("answerPage");
  };

  useEffect(() => {
    console.log(activeView); 
  }, [activeView]);
  

  const renderTags = () => {
    let rows = [];
    for (let i = 0; i < tagNames.length; i += 3) {
      let tagsForRow = [];
      for (let j = i; j < i + 3 && j < tagNames.length; j++) {
        tagsForRow.push(
          <div
            key={tagNames[j]}
            onClick={() => handleTagClick(tagNames[j])}
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px dotted black",
              padding: "0%",
              width: "25%",
              textAlign: "center",
              height: "60%",
              marginLeft: "8%",
              marginRight: "8%",
            }}
          >
            <div style={{ color: "blue", textDecoration: "underline" }}>
              {tagNames[j]}
            </div>
            <div style={{ color: "black" }}>
              {frequencies[j]} question{frequencies[j] > 1 ? "s" : ""}
            </div>
          </div>
        );
      }
      rows.push(
        <div
          key={i}
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            marginBottom: "5%",
            marginTop: i === 0 ? "5%" : "0",
          }}
        >
          {tagsForRow}
        </div>
      );
    }
    return rows;
  };

  if (selectedTag) {
    return (
      <div>
        <div id="secondRow">
          <div id="left">
            <h3>
              {filteredQuestions.length}{" "}
              {filteredQuestions.length === 1 ? "question" : "questions"}{" "}
              tagged: {selectedTag}
            </h3>
          </div>
          <div id="right">
            <button type="button" id="newestButton">
              Newest
            </button>
            <button type="button" id="activeButton">
              Active
            </button>
            <button type="button" id="unansweredButton">
              Unanswered
            </button>
          </div>
        </div>
        {renderQuestions(filteredQuestions)}
      </div>
    );
  }

  function renderQuestions(questionsToRender) {
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
    return questionsToRender.map((question) => (
      <div
        key={question._id}
        className="question"
        style={{ cursor: "pointer" }}
        onClick={() => handleQuestionClick(question)}
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
              <span style={{ color: "red" }}>{question.asked_by}</span> asked{" "}
              {findDate(question.ask_date_time)}
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
    ));
  }

  return <div>{renderView()}</div>;
}

export default Tags;