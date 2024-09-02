
import React, { useState, useEffect } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";

function AnswerPage({
  model,
  selectedQuestion,
  onAnswerPosted,
  setActiveView,
  updateModel,
}) {
  console.log("I am here ");
  const [currentPage, setCurrentPage] = useState(0);
  const [questionVote, setQuestionVote] = useState(null);
  const [answerVotes, setAnswerVotes] = useState(
    model.answers.reduce((acc, answer) => {
      acc[answer._id] = null;
      return acc;
    }, {})
  );
  const [questionComments, setQuestionComments] = useState([]);
  const [answerComments, setAnswerComments] = useState({});
  const [newQuestionComment, setNewQuestionComment] = useState("");
  const [newAnswerComments, setNewAnswerComments] = useState({});
  const answersPerPage = 5;
  const commentsPerPage = 3;

  const [currentCommentPage, setCurrentCommentPage] = useState(0);
  const [currentAnswerPage, setCurrentAnswerPage] = useState(0);
  const [currentAnswerCommentPages, setCurrentAnswerCommentPages] = useState(
    {}
  );

  const handleNextAnswer = () => {
    setCurrentAnswerPage(
      (prevPage) =>
        (prevPage + 1) %
        Math.ceil(selectedQuestion.answers.length / answersPerPage)
    );
  };

  const handlePrevAnswer = () => {
    setCurrentAnswerPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };

  const current_Answers = selectedQuestion.answers.slice(
    currentAnswerPage * answersPerPage,
    (currentAnswerPage + 1) * answersPerPage
  );

  const [forceUpdate, setForceUpdate] = useState(0);

  const handleNextCommentAnswers = (answerId) => {
    setCurrentAnswerCommentPages((prevPages) => ({
      ...prevPages,
      [answerId]:
        ((prevPages[answerId] || 0) + 1) %
        Math.ceil(answerComments[answerId].length / commentsPerPage),
    }));
  };

  const handlePrevCommentAnswers = (answerId) => {
    setCurrentAnswerCommentPages((prevPages) => ({
      ...prevPages,
      [answerId]: (prevPages[answerId] || 0) > 0 ? prevPages[answerId] - 1 : 0,
    }));
  };

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const questionResponse = await fetch(
          `http://localhost:8000/comments/question/${selectedQuestion._id}`
        );
        const questionData = await questionResponse.json();
        setQuestionComments(questionData || []);

        const answerData = {};
        await Promise.all(
          selectedQuestion.answers.map(async (answerId) => {
            try {
              const response = await fetch(
                `http://localhost:8000/comments/answer/${answerId}`
              );
              const data = await response.json();
              answerData[answerId] = data || [];
            } catch (error) {
              console.error(
                "Error loading comments for answer:",
                answerId,
                error
              );
              answerData[answerId] = []; 
            }
          })
        );
        setAnswerComments(answerData);
      } catch (error) {
        console.error("Error loading comments:", error);
        setQuestionComments([]); 
      }
    };
    fetchComments();
  }, [selectedQuestion._id, selectedQuestion.answers]);

  const handleAddComment = async (type, parentId, content, setter) => {
    if (content.length > 140) {
      alert("Comment must be under 140 characters.");
      return;
    }
    if (model.user.reputation < 50) {
      alert("You need at least 50 reputation to add a comment.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/comments/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          parentID: parentId,
          userID: model.user._id,
          parent_type: type === "question" ? "question" : "answer",
          commentBy: model.user.username,
        }),
      });
      const data = await response.json();
      if (type === "question") setter((prev) => [data, ...prev]);
      else {
        setter((prev) => ({
          ...prev, 
          [parentId]: [data, ...(prev[parentId] || [])], 
        }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const renderComments = (
    comments,
    parentId,
    newCommentState,
    setNewCommentState,
    commentSetter,
    type,
    currentPage
  ) => (
    <>
      {Array.isArray(comments) ? (
        comments.length > 0 ? (
          comments
            .slice(
              currentPage * commentsPerPage,
              (currentPage + 1) * commentsPerPage
            )
            .map((comment) => (
              <div key={comment._id} className="comment">
                <p>{comment.content}</p>
                <p>
                  By {comment.commentBy || "Anonymous"} - Votes: {comment.votes}
                </p>
                <button
                  onClick={() => handleUpvoteComment(comment._id, type)}
                  disabled={
                    comment.upvotedBy &&
                    comment.upvotedBy.includes(model.user._id)
                  } 
                >
                  👍
                </button>
                <button
                  onClick={() =>
                    window.alert("Downvoting on a comment is not allowed")
                  }
                >
                  👎
                </button>
              </div>
            ))
        ) : (
          <p>No comments yet</p> 
        )
      ) : (
        <p>Loading comments...</p> 
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddComment(type, parentId, newCommentState, commentSetter);
          setNewCommentState("");
        }}
      >
        <input
          type="text"
          value={newCommentState}
          onChange={(e) => setNewCommentState(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );

  const handleNextComment = () => {
    const maxPage = Math.ceil(questionComments.length / commentsPerPage) - 1;
    setCurrentCommentPage((prevPage) =>
      prevPage + 1 > maxPage ? 0 : prevPage + 1
    );
  };

  const handlePrevComment = () => {
    setCurrentCommentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0));
  };

  const findDate = (dateTime) => {
    const date = new Date(dateTime);
    const now = new Date();
    const diff = now - date;
    return diff < 24 * 60 * 60 * 1000
      ? `${Math.floor(diff / (60 * 60 * 1000))} hours ago`
      : date.toLocaleString("default", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
        });
  };

  const handleUpvoteComment = async (commentId, type) => {
    try {
      if (type === "question") {
        const response = await fetch(
          `http://localhost:8000/comments/upvote/${commentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: model.user._id }), 
          }
        );
        const updatedComment = await response.json();

        setQuestionComments((questionComments) =>
          questionComments.map((comment) => {
            if (comment._id === commentId) {
              const hasVoted = comment.upvotedBy.includes(model.user._id);
              return {
                ...comment,
                votes: updatedComment.votes,
                upvotedBy: hasVoted
                  ? comment.upvotedBy.filter((id) => id !== model.user._id) 
                  : [...comment.upvotedBy, model.user._id], 
              };
            }

            return comment;
          })
        );
      } else {
        window.alert(
          "Commented vote updated. Need to refresh to see the result."
        );
        const response = await fetch(
          `http://localhost:8000/comments/upvote/${commentId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: model.user._id }), 
          }
        );
        const updatedComment = await response.json();
        setAnswerComments((answerComments) => {
          const answerId = updatedComment.parentID; 
          const existingComments = answerComments[answerId] || []; 

          const updatedComments = existingComments.map((comment) => {
            if (comment._id === commentId) {
              const hasVoted = comment.upvotedBy.includes(model.user._id);

              return {
                ...comment,
                votes: updatedComment.votes,
                upvotedBy: hasVoted
                  ? comment.upvotedBy.filter((id) => id !== model.user._id) 
                  : [...comment.upvotedBy, model.user._id],
              };
            }
            return comment;
          });
          setForceUpdate((u) => u + 1);
          return { ...answerComments, [answerId]: updatedComments };
        });
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  const updateVoteCount = async (voteType, increment, qid) => {
    const url = `http://localhost:8000/questions/${voteType}`;

    console.log(increment);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ increment, qid }),
      });
      const data = await response.json();
      console.log("Vote update success:", data);

      updateModel(); // Update the model with new question data
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const updateAnswerVote = async (answerId, voteType, increment) => {
    console.log("in answer vote");

    const url = `http://localhost:8000/answers/${voteType}`;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ increment, qid: answerId }),
      });
      const data = await response.json();
      console.log("Vote update success:", data);
      updateModel();
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  const handleQuestionVote = (type, id) => {
    if (model.user.reputation >= 50) {
      console.log("Current vote before action:", questionVote); // Check the current vote state

      let increment = 0;

      if (questionVote === null) {
        increment = 1;
        console.log("Voting for the first time, increment set to:", increment);
      } else if (questionVote === type) {
        increment = -1;
        console.log("Toggling off the vote, increment set to:", increment);
      }

      const newVote = questionVote === type ? null : type;
      console.log("New vote state:", newVote);

      setQuestionVote(newVote);

      const voteType = type === "up" ? "upvote" : "downvote";

      window.alert(
        "Vote updated. You will need to refresh to see the vote as you are still on the same page."
      );

      console.log(
        "Vote type for the update:",
        voteType,
        "with increment:",
        increment
      );

      updateVoteCount(voteType, increment, id);
    } else {
      window.alert("You are not allowed to vote due to low reputation");
    }
  };

  const handleAnswerVote = (type, id) => {
    if (model.user.reputation >= 50) {
      const currentVote = answerVotes[id];

      let increment = 0;

      if (currentVote === null) {
        increment = 1;
      } else if (currentVote === type) {
        increment = -1;
        console.log("Toggling off the vote, increment set to:", increment);
      }
      const newVote = currentVote === type ? null : type;
      setAnswerVotes((prev) => ({ ...prev, [id]: newVote }));
      const voteType = type === "up" ? "upvote" : "downvote";
      console.log("answer vote");
      updateAnswerVote(id, voteType, increment);
    } else {
      window.alert("You are not allowed to vote due to low repuration");
    }
  };

  const sortedAnswers = selectedQuestion.answers
    .map((ansId) => model.answers.find((answer) => answer._id === ansId))
    .filter((answer) => answer)
    .sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

  const indexOfLastAnswer = (currentPage + 1) * answersPerPage;
  const indexOfFirstAnswer = indexOfLastAnswer - answersPerPage;
  const currentAnswers = sortedAnswers.slice(
    indexOfFirstAnswer,
    indexOfLastAnswer
  );

  const handleNext = () => {
    const totalPages = Math.ceil(sortedAnswers.length / answersPerPage);
    setCurrentPage((prevPage) => (prevPage + 1) % totalPages); // wrap-around to the first page after the last
  };

  const handlePrev = () => {
    setCurrentPage((prevPage) => (prevPage > 0 ? prevPage - 1 : 0)); // prevent going below 0
  };

  return (
    <>
      <div key={forceUpdate}>
        <div className="firstRow">
          <div
            className="questionStats"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            Total Answers: {selectedQuestion.answers.length} | Total Views:{" "}
            {selectedQuestion.views} | Total UpVotes: {selectedQuestion.upvote}{" "}
            | Total DownVotes: {selectedQuestion.downvote}
            <button
              id="askQuestionButton"
              onClick={() => setActiveView("askQuestion")}
            >
              Ask Question
            </button>
          </div>
          <h1>{selectedQuestion.title}</h1>
        </div>
        <div className="questionDetails">
          <p>{selectedQuestion.text}</p>
          <p>Summary: {selectedQuestion.summary}</p>
          <div className="tags">
            {selectedQuestion.tags.map((tagId, index) => {
              const tag = model.tags.find((t) => t._id === tagId);
              return tag ? (
                <span key={index} className="tag">
                  {tag.name}
                </span>
              ) : null;
            })}
          </div>
          <p>
            Asked by{" "}
            <span className="username">{selectedQuestion.asked_by}</span> on{" "}
            {findDate(selectedQuestion.ask_date_time)}
          </p>
          <div style={{ alignItems: "center" }}>
            <button
              onClick={() => handleQuestionVote("up", selectedQuestion._id)}
              disabled={questionVote === "down"}
            >
              👍
            </button>
            <button
              onClick={() => handleQuestionVote("down", selectedQuestion._id)}
              disabled={questionVote === "up"}
            >
              👎
            </button>
          </div>
          <div className="commentSection">
            <h3>Question Comments:</h3>
            {renderComments(
              questionComments,
              selectedQuestion._id,
              newQuestionComment,
              setNewQuestionComment,
              setQuestionComments,
              "question",
              currentCommentPage
            )}
            <div className="navigationButtons">
              <button
                onClick={handlePrevComment}
                disabled={currentCommentPage === 0}
              >
                Prev
              </button>
              <button
                onClick={handleNextComment}
                disabled={
                  currentCommentPage >=
                  Math.ceil(questionComments.length / commentsPerPage) - 1
                }
              >
                Next
              </button>
            </div>
          </div>
        </div>
        <hr />

        <div className="answersList">
          <h3>Answers</h3>

          {currentAnswers.map((answer) => (
            <div key={answer._id} className="answer">
              <p className="answerText">{answer.text}</p>
              <div className="answerInfo">
                <div>UpVotes: {answer.upvote}</div>
                <div>DownVotes: {answer.downvote}</div>
                <p>
                  Answered by <span className="username">{answer.ans_by}</span>{" "}
                  on {findDate(answer.ans_date_time)}
                </p>
                <button
                  onClick={() => handleAnswerVote("up", answer._id)}
                  disabled={answerVotes[answer._id] === "down"}
                >
                  👍
                </button>
                <button
                  onClick={() => handleAnswerVote("down", answer._id)}
                  disabled={answerVotes[answer._id] === "up"}
                >
                  👎
                </button>
                <h3>Answer Comments:</h3>
                {renderComments(
                  answerComments[answer._id],
                  answer._id,
                  newAnswerComments[answer._id],
                  (comment) =>
                    setNewAnswerComments({
                      ...newAnswerComments,
                      [answer._id]: comment,
                    }),
                  setAnswerComments,
                  "answer",
                  currentAnswerCommentPages[answer._id] || 0
                )}

                <div className="navigationButtons">
                  <button
                    onClick={() => handlePrevCommentAnswers(answer._id)}
                    disabled={
                      (currentAnswerCommentPages[answer._id] || 0) === 0
                    }
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => handleNextCommentAnswers(answer._id)}
                    disabled={
                      (currentAnswerCommentPages[answer._id] || 0) >=
                      Math.ceil(
                        (answerComments[answer._id] || []).length /
                          commentsPerPage
                      ) -
                        1
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
              <hr />
            </div>
          ))}
        </div>
        <div className="navigationButtons">
          <button onClick={handlePrev} disabled={currentPage === 0}>
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={
              currentPage >=
              Math.ceil(selectedQuestion.answers.length / answersPerPage) - 1
            }
          >
            Next
          </button>
        </div>
        <div className="navigationButtons">
          <button
            id="answerQuestionButton"
            onClick={() => setActiveView("answerQuestion")}
          >
            Answer Question
          </button>
        </div>
      </div>
    </>
  );
}
export default AnswerPage;
