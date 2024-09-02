import React, { useState } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";
import axios from "axios";

async function updateAnswer(data,updateModel)
{
  const url = "http://localhost:8000/add_answer";

  console.log("in update");

  await axios.post(url, data)
      .then(response => {
        console.log("Sucessfully added and updated answers.")
        
        updateModel();
      })
      .catch(error => {
          console.error('Error sending data:', error);
      });
}


function AnswerForm({ model,updateModel, selectedQuestion, onAnswerPosted }) {

  
  const [answerText, setAnswerText] = useState("");

  const [errorMessages, setErrorMessages] = useState([]);
 // const [usernameError, setUsernameError] = useState("");
  const [answerTextError, setAnswerTextError] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();

    let isValid = true;
    let errors = [];
   let trimmedUsername = "hello";
    let trimmedAnswerText = answerText.trim();

    if (
      //trimmedUsername === "" ||
      trimmedUsername === '""' ||
      trimmedUsername === "''"
    ) {
     // setUsernameError("Username cannot be empty or consist only of quotes.");
      errors.push("Username cannot be empty or consist only of quotes.");
      isValid = false;
    }

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
   
      const newAnswer = {
        text: answerText,
        ans_by:model.user.username,
        ans_date_time: new Date(),
        selectedQuestion:selectedQuestion,
        upvote:0,
        downvote:0,
        user:model.user
      };

      const newUpdatedAnswer= await updateAnswer(newAnswer,updateModel);

      alert("Answer added successfully!");

     
  

      console.log(model.questions);

      console.log("Posting answer...");
      setAnswerText("");
     // setUsername("");
      setErrorMessages([]);
      onAnswerPosted(model);
     
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

export default AnswerForm;

/* <div>
          <label htmlFor="answerUsername">Username*</label>
          <input
            type="text"
            id="answerUsername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
          />
          {usernameError && <div style={{ color: "red" }}>{usernameError}</div>}
        </div>*/