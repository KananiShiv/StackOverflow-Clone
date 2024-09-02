import React, { useState } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";
import axios from "axios";

function EditAnswerForm({
  model,
  updateModel,
  selectedAnswer,
  onAnswerPosted,
}) {
  const [answerText, setAnswerText] = useState(selectedAnswer.text);
  const [errorMessages, setErrorMessages] = useState([]);
  const [answerTextError, setAnswerTextError] = useState("");

  const initialText = selectedAnswer.text;

  const hasChanges = () => {
    return initialText !== answerText;
  };

  const updateAnswer = async (updatedAnswer, aid) => {
    const url = `http://localhost:8000/update_answer/${aid}`;

    await axios
      .put(url, updatedAnswer)
      .then((response) => {
        console.log("Answer updated successfully");
      })
      .catch((error) => {
        console.error("Error updating answer:", error);
      });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    let isValid = true;
    let errors = [];

    let trimmedAnswerText = answerText.trim();

    if (
      trimmedAnswerText === "" ||
      trimmedAnswerText === '""' ||
      trimmedAnswerText === "''"
    ) {
      setAnswerTextError(
        "Answer text cannot be empty or consist only of quotes."
      );
      errors.push("Answer text cannot be empty or consist only of quotes.");
      isValid = false;
    }

    let currentPosition = 0;
    while (currentPosition < answerText.length) {
      let linkTextStart = answerText.indexOf("[", currentPosition);
      let linkTextEnd = answerText.indexOf("]", linkTextStart);
      let linkStart = answerText.indexOf("(", linkTextEnd);
      let linkEnd = answerText.indexOf(")", linkStart);

      if (
        linkTextStart === -1 ||
        linkTextEnd === -1 ||
        linkStart === -1 ||
        linkEnd === -1
      ) {
        break;
      }

      let linkText = answerText.substring(linkTextStart + 1, linkTextEnd);
      let link = answerText.substring(linkStart + 1, linkEnd);

      if (!link.startsWith("http://") && !link.startsWith("https://")) {
        errors.push(
          `The link for "${linkText}" must begin with "http://" or "https://".`
        );
        isValid = false;
      }

      currentPosition = linkEnd + 1;
    }

    setErrorMessages(errors);

    if (!isValid) {
      alert("Please correct the following errors:\n" + errors.join("\n"));
      return;
    } else {
      if (!hasChanges()) {
        window.alert("No changes detected.");
      } else {
        let newAnswer = {
          text: answerText,
        };
        await updateAnswer(newAnswer, selectedAnswer._id);
        alert("Answer updated successfully!12");
        updateModel();
      }
      onAnswerPosted();
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="answerText">Answer Text*</label>
          <textarea
            id="answerText"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Enter Answer Text"
          />
          {answerTextError && (
            <div style={{ color: "red" }}>{answerTextError}</div>
          )}
        </div>
        {false && (
          <div style={{ color: "red" }}>
            <ul>
              {errorMessages.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button type="submit">Post Answer</button>
          <span style={{ color: "red" }}>* indicates mandatory fields</span>
        </div>
      </form>
    </div>
  );
}

export default EditAnswerForm;
