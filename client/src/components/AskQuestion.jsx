import React, { useState, useEffect } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";
import axios from "axios";

async function updateTags(data, newQuestion) {
  console.log("in update tags");

  const url = "http://localhost:8000/add_tag";

  await axios
    .post(url, data)
    .then((response) => {
      console.log(response.data.tag);
      newQuestion.tags.push(response.data.tag);
      console.log(response.data.tag);
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}

async function updateUserTags(data) {
  console.log("in update tags");

  const url = "http://localhost:8000/update_usertag";

  await axios
    .post(url, data)
    .then((response) => {})
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}

async function updateQuestion(data) {
  const url = "http://localhost:8000/add_question";

  console.log("in update");

  await axios
    .post(url, data)
    .then((response) => {
      console.log("Question added successfully");
    })
    .catch((error) => {
      console.error("Error sending data:", error);
    });
}

function AskQuestion({ model, updateModel, onQuestionPosted }) {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionSummary, setQuestionSummary] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [tags, setTags] = useState("");
  const [username, setUsername] = useState("");
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {
    setUsername(model.user.username);
  }, [model.username]);

  const postQuestion = async (e) => {
    e.preventDefault();

    let isValid = true;
    let errors = [];

    let trimmedTitle = questionTitle.trim();
    let trimmedText = questionText.trim();
    let trimmedUsername = username.trim();

    if (trimmedTitle === "" || trimmedTitle === '""' || trimmedTitle === "''") {
      errors.push("Title cannot be empty or consist only of quotes.");
      isValid = false;
    }

    if (trimmedText === "" || trimmedText === '""' || trimmedText === "''") {
      errors.push("Question text cannot be empty or consist only of quotes.");
      isValid = false;
    }

    if (
      trimmedUsername === "" ||
      trimmedUsername === '""' ||
      trimmedUsername === "''"
    ) {
      errors.push("Username cannot be empty or consist only of quotes.");
      isValid = false;
    }
    const enteredTags = tags.split(/\s+/).map((tag) => tag.trim());

    if (enteredTags.some((tag) => tag.length > 10)) {
      errors.push("Each tag must be 10 characters or less.");
      isValid = false;
    }

    if (enteredTags.length > 5) {
      errors.push("You cannot have more than 5 tags.");
      isValid = false;
    }

    if (questionTitle.length > 50) {
      errors.push("Title must be less than or equal to 100 characters.");
      isValid = false;
    }

    if (questionSummary.length > 140) {
      errors.push("Title must be less than or equal to 100 characters.");
      isValid = false;
    }

    if (!questionTitle || !questionText || !tags.trim() || !username.trim()) {
      errors.push("All fields are mandatory.");
      isValid = false;
    }

    setErrorMessages(errors);

    if (!isValid) {
      alert("Please correct the following errors:\n" + errors.join("\n"));
      return;
    } else {
      let newQuestion = {
        title: questionTitle,
        text: questionText,
        summary: questionSummary,
        asked_by: username,
        ask_date_now: new Date(),
        answers: [],
        views: 0,
        tags: [],
        user: model.user._id,
      };
      // Split the tags by spaces and remove empty strings if any
      const enteredTags = tags.split(/\s+/);
      for (const tagName of enteredTags) {
        const existingTag = model.tags.find(
          (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
        );

        if (existingTag) {
          newQuestion.tags.push(existingTag);
          const data = { tag_id: existingTag, user_id: model.user._id };
          updateUserTags(data);
        } else {
          if (model.user.reputation >= 50) {
            const data = { name: tagName, user_id: model.user._id };
            await updateTags(data, newQuestion); // Correct use of await
          } else {
            window.alert(
              "Tags cannot be created as you have reputation less than 50. Question Posted."
            );
          }
        }
      }

      await updateQuestion(newQuestion);

      alert("Question added successfully!");

      updateModel();

      setQuestionTitle("");
      setQuestionText("");
      setQuestionSummary("");
      setTags("");
      setUsername("");
      setErrorMessages([]);
      onQuestionPosted();
    }
  };

  return (
    <div>
      {errorMessages.length > 0 && (
        <ul>
          {errorMessages.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      )}
      <form onSubmit={postQuestion}>
        <div>
          <label htmlFor="questionTitle">Question Title*</label>
          <input
            type="text"
            id="questionTitle"
            value={questionTitle}
            onChange={(e) => setQuestionTitle(e.target.value)}
            placeholder="Enter Question Title"
          />
        </div>
        <div>
          <label htmlFor="questionSummary">Question Summary</label>
          <textarea
            id="questionSummary"
            value={questionSummary}
            onChange={(e) => setQuestionSummary(e.target.value)}
            placeholder="Enter Question Summary"
          />
        </div>
        <div>
          <label htmlFor="questionText">Question Text*</label>
          <textarea
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter Question Text"
          />
        </div>
        <div>
          <label htmlFor="tags">Tags*</label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter Tags"
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button type="submit">Post Question</button>
          <span style={{ color: "red" }}>* indicates mandatory fields</span>
        </div>
      </form>
    </div>
  );
}

export default AskQuestion;

/*

/*<div>
          <label htmlFor="username">Username*</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
          />
        </div>*/
