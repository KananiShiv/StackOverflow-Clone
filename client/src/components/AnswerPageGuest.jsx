
import React, { useState, useEffect } from "react";
import "../stylesheets/AskQuestion.css";
import "../stylesheets/Question.css";

function AnswerPageGuest({
  model,
  selectedQuestion,
  onAnswerPosted,
  setActiveView,
  updateModel,
}) {
  console.log("I am here ");
  const [currentPage, setCurrentPage] = useState(0);

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
              answerData[answerId] = []; // Set default empty array on error
            }
          })
        );
        setAnswerComments(answerData);
      } catch (error) {
        console.error("Error loading comments:", error);
        setQuestionComments([]); // Ensure state is set even on error
      }
    };
    fetchComments();
  }, [selectedQuestion._id, selectedQuestion.answers]);
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
                <button onClick={() => window.alert("Guests cannot vote")}>
                  👍
                </button>
                <button onClick={() => window.alert("Guests cannot vote")}>
                  👎
                </button>
              </div>
            ))
        ) : (
          <p>No comments yet</p> // Shown if there are truly no comments at all
        )
      ) : (
        <p>Loading comments...</p> // Optionally handle loading state
      )}
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
            <button onClick={() => window.alert("Guests cannot vote")}>
              👍
            </button>
            <button onClick={() => window.alert("Guests cannot vote")}>
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
                <button onClick={() => window.alert("Guests cannot vote")}>
                  👍
                </button>
                <button onClick={() => window.alert("Guests cannot vote")}>
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
      </div>
    </>
  );
}

export default AnswerPageGuest;
