import React, { useState, useEffect } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";
import axios from "axios";

function EditQuestionPage({ model, updateModel, question, onQuestionUpdated, }) {
  // Initial state set up with question properties
  const [questionTitle, setQuestionTitle] = useState(question.title);
  const [questionSummary, setQuestionSummary] = useState(question.summary);
  const [questionText, setQuestionText] = useState(question.text);
  const [errorMessages, setErrorMessages] = useState([]);

  // Store initial values to compare against
  const initialTitle = question.title;
  const initialSummary = question.summary;
  const initialText = question.text;

  const hasChanges = () => {
    return (
      questionTitle !== initialTitle ||
      questionSummary !== initialSummary ||
      questionText !== initialText
    );
  };

  const updateQuestion = async (updatedQuestion, qid) => {
    const url = `http://localhost:8000/update_question/${qid}`;

    await axios
      .put(url, updatedQuestion)
      .then((response) => {
        console.log("Question updated successfully.");
      })
      .catch((error) => {
        console.error("Error updating question:", error);
      });
  };

  const postQuestion = async (e) => {
    e.preventDefault();

    let isValid = true;
    let errors = [];

    // Validate fields
    if (questionTitle.trim() === "" || questionText.trim() === "") {
      errors.push("Title and question text cannot be empty.");
      isValid = false;
    }

    if (questionTitle.length > 100 || questionSummary.length > 140) {
      errors.push(
        "Title must be less than or equal to 100 characters. Summary must be less than or equal to 140 characters."
      );
      isValid = false;
    }

    setErrorMessages(errors);

    if (!isValid) {
      alert("Please correct the following errors:\n" + errors.join("\n"));
      return;
    }

    if (!hasChanges()) {
      window.alert("No changes detected.");
    } else {
      // Proceed with updating the question if changes exist and validation passes
      let updatedQuestion = {
        title: questionTitle,
        text: questionText,
        summary: questionSummary,
      };

      await updateQuestion(updatedQuestion, question._id);
      alert("Question updated successfully!");
      updateModel();
    }
    updateModel();
    onQuestionUpdated(); // Navigate away after successful update
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
            placeholder={questionText}
          />
        </div>
        <div>
          <label htmlFor="questionSummary">Question Summary</label>
          <textarea
            id="questionSummary"
            value={questionSummary}
            onChange={(e) => setQuestionSummary(e.target.value)}
            placeholder={questionSummary}
          />
        </div>
        <div>
          <label htmlFor="questionText">Question Text*</label>
          <textarea
            id="questionText"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={questionText}
          />
        </div>
        <button type="submit">Post Updated Question</button>
      </form>
    </div>
  );
}

export default EditQuestionPage;
