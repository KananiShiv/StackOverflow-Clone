import React, { useEffect, useState } from "react";
import axios from "axios";
import EditQuestionsPage from "./EditQuestionsPage.jsx";
import EditAnswerForm from "./EditAnswerForm.jsx";

function UserProfile({ key, model, updateModel }) {
  const [data, setData] = useState({
    questions: [],
    answers: [],
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("profile"); // 'profile' or 'edit'
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderTags = () => {
    let rows = [];
    for (let i = 0; i < data.tags.length; i += 3) {
      let tagsForRow = [];
      for (let j = i; j < i + 3 && j < data.tags.length; j++) {
        tagsForRow.push(
          <div
            key={data.tags[j]._id}
            onClick={() => handleTagClick(data.tags[j]._id)}
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px dotted black",
              padding: "1%",
              width: "30%",
              textAlign: "center",
              height: "50px",
              marginLeft: "10%",
              marginRight: "10%",
            }}
          >
            <div style={{ color: "blue", textDecoration: "underline" }}>
              {data.tags[j].name}
              <div>
                <button onClick={() => handleTagEdit(data.tags[j]._id)}>
                  Edit
                </button>
                <button onClick={() => handleTagDelete(data.tags[j]._id)}>
                  Delete
                </button>
              </div>
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
            justifyContent: "space-evenly",
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

  const handleQuestionEdit = (questionId) => {
    const question = data.questions.find((q) => q._id === questionId);
    setCurrentQuestion(question);
    setActivePage("edit");
  };
  const handleAnswerEdit = (answerId) => {
    const answer = data.answers.find((a) => a._id === answerId);
    setCurrentAnswer(answer);
    console.log("current answer: ", answer);
    setActivePage("editAnswer");
  };

  const handleAnswerDelete = (answerId) => {
    if (window.confirm("Are you sure you want to delete this answer?")) {
      axios
        .delete(`http://localhost:8000/api/answers/${answerId}`)
        .then(() => {
          alert("Answer deleted successfully.");
          const updatedAnswers = data.answers.filter((answer) => answer._id !== answerId);
          setData((prevState) => ({
            ...prevState,
            answers: updatedAnswers,
          }));
        })
        .catch((error) => {
          console.error("Failed to delete answer:", error);
          alert("Error deleting answer. Please try again.");
        });
    }
  };
  

  const handleQuestionDelete = (questionId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this question and all associated content?"
      )
    ) {
      axios
        .delete(`http://localhost:8000/api/questions/${questionId}`)
        .then(() => {
          alert("Question and related data deleted successfully.");
          const updatedQuestions = data.questions.filter(
            (q) => q._id !== questionId
          );
          setData((prevState) => ({
            ...prevState,
            questions: updatedQuestions,
          }));
        })
        .catch((error) => {
          console.error("Failed to delete question:", error);
          alert("Error deleting question. Please try again.");
        });
    }
  };

  const handleTagEdit = (tagId) => {
    // Logic to handle tag edit
  };

  const handleTagClick = (tagId) => {
    // Logic to handle tag edit
  };

  const handleTagDelete = (tagId) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      axios
        .delete(`http://localhost:8000/api/tags/${tagId}`)
        .then((response) => {
          // Use different alerts based on the status code
          if (response.status === 200) {
            alert(response.data.message);  // Successful deletion message
            // Filter out the deleted tag from the local state
            const updatedTags = data.tags.filter((tag) => tag._id !== tagId);
            setData((prevState) => ({
              ...prevState,
              tags: updatedTags,
            }));
          } else if (response.status === 201) {
            alert(response.data.message);  // Message when tag cannot be deleted because it's used by others
          }
        })
        .catch((error) => {
          console.error("Failed to delete tag:", error);
          alert("Error deleting tag. Please try again.");
        });
    }
  };
  
  useEffect(() => {
    console.log("Current model:", model);
    if (model.user) {
      console.log(model.user);
      const fetchQuestions = model.user.questions.map((q) =>
        axios.get(`http://localhost:8000/api/questions/${q}`)
      );
      const fetchAnswers = model.user.answers.map((a) =>
        axios.get(`http://localhost:8000/api/answers/${a}`)
      );
      const fetchTags = model.user.tags.map((t) =>
        axios.get(`http://localhost:8000/api/tags/${t}`)
      );

      Promise.all([...fetchQuestions, ...fetchAnswers, ...fetchTags])
        .then((results) => {
          const questions = results
            .slice(0, model.user.questions.length)
            .map((res) => res.data);
          const answers = results
            .slice(
              model.user.questions.length,
              model.user.questions.length + model.user.answers.length
            )
            .map((res) => res.data);
          const tags = results
            .slice(model.user.questions.length + model.user.answers.length)
            .map((res) => res.data);
          setData({ questions, answers, tags });
          setLoading(false);

          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setLoading(false);
        });
    }
  }, [model.user, model.user.questions, model.user.answers, model.user.tags]);

  if (loading) {
    return <div>Loading...</div>;
  }

  
  if (activePage === "edit" && currentQuestion) {
    return (
      <EditQuestionsPage
        model={model}
        updateModel={updateModel}
        question={currentQuestion}
        onQuestionUpdated={() => setActivePage("profile")}
      />
    );
  } else if (activePage === "editAnswer" && currentAnswer) {
    return (
      <EditAnswerForm
        model={model}
        updateModel={updateModel}
        selectedAnswer={currentAnswer}
        onAnswerPosted={() => setActivePage("profile")}
      />
    );
  } else {
    return (
      <div className="user-profile">
        <h1>User Profile : {model.user.username}</h1>
        <p>Member since: {formatDate(model.user.memberSince)}</p>
        <p>Reputation: {model.user.reputation}</p>
        {data.questions.length === 0 && data.answers.length === 0 && data.tags.length === 0 ? (
          <h1 style={{ color: "red" }}>There are no questions, answers, and tags posted by you. It is highly recommended you do something about that.</h1>
        ) : (
          <>
            <h3>Your Questions:</h3>
            <ul>
              {data.questions.map((question) => (
                <li key={question._id}>
                  <p>
                    <a href="#" onClick={() => handleQuestionEdit(question._id)}>
                      {question.title}
                    </a>
                  </p>
                  <button onClick={() => handleQuestionDelete(question._id)}>Delete</button>
                </li>
              ))}
            </ul>
            <h3>Your Answers:</h3>
            <ul>
              {data.answers.map((answer) => (
                <li key={answer._id}>
                  <p>
                    <a href="#" onClick={() => handleAnswerEdit(answer._id)}>
                      {answer.text}
                    </a>
                  </p>
                  <button onClick={() => handleAnswerDelete(answer._id)}>Delete</button>
                </li>
              ))}
            </ul>
            <h3>Your Tags:</h3>
            {renderTags()}
          </>
        )}
        <hr />
      </div>
    );
  }
}

export default UserProfile;
