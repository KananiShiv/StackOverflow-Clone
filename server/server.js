// Application server
// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.

const express = require("express");
const app = express();
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
console.log("JWT Secret:", process.env.JWT_SECRET);
const mongoose = require("mongoose");
const cors = require("cors");
const question = require("./models/questions");
const answer = require("./models/answers");
const tag = require("./models/tags");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/User");
const jwt = require("jsonwebtoken");
const Comment = require("./models/comments");

app.set("views", path.join(__dirname, "views"));

app.use(cors());

app.use(express.json());

app.use(cookieParser());

app.use((error, req, res, next) => {
  console.error(error); // Log the error for server-side debugging
  res.status(500).json({ message: "Irerenternal server error" });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/fake_so", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(" Connection open ");
  })
  .catch((err) => {
    console.log("Error Connecting");
  });

app.listen(8000, () => {
  console.log("APP is listening on port 8000!");
});

app.get("/", async function (req, res) {
  const questions = await question.find({});
  const tags = await tag.find({});
  const answers = await answer.find({});
  //const user = await UserModel.findById(req.userId);

  res.json({
    questions: questions,
    tags: tags,
    answers: answers,
    //user: user,
  });
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.json(users);
  } catch (error) {
    console.error("Failed to retrieve users", error);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
});

app.get("/user", async function (req, res) {
  console.log(req.query.email); // Use query parameters for GET requests
  const user = await UserModel.findOne({ email: req.query.email }); // Find user by email

  if (user) {
    res.json({ user });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

app.post("/add_tag", async function (req, res) {
  const { name, user_id } = req.body;

  console.log(name);

  if (!name) {
    return res.status(400).send({ message: "Tag name is required" });
  }

  try {
    const newTag = new tag({ name: name, user_id: user_id });
    await newTag.save();

    await UserModel.findByIdAndUpdate(
      user_id,
      { $push: { tags: newTag._id } },
      { new: true }
    );

    console.log(newTag);

    return res.json({ tag: newTag });
  } catch (error) {
    console.error("Failed to add or update tag:", error);
  }
});

app.post("/update_usertag", async function (req, res) {
  const { tag_id, user_id } = req.body;

  try {
    const updateUser = await UserModel.findByIdAndUpdate(
      user_id,
      { $addToSet: { tags: tag_id } },
      { new: true }
    );

    const updateTag = await tag.findByIdAndUpdate(
      tag_id,
      { $addToSet: { user_id: user_id } },
      { new: true }
    );
    console.log(updateUser);
    console.log(updateTag);

    return res.json({ updateUser });
  } catch (error) {
    console.error("Failed to add or update tag:", error);
  }
});

app.post("/add_question", async function (req, res) {
  const {
    title,
    text,
    summary,
    asked_by,
    ask_date_now,
    answers,
    views,
    tags,
    user,
  } = req.body;

  console.log(title);

  if (title.length > 50) {
    return res.status(400).send({ message: "Maximum Length of title reached" });
  }

  try {
    const newQuestion = new question({
      title: title,
      text: text,
      summary: summary,
      asked_by: asked_by,
      ask_date_now: ask_date_now,
      answers: answers,
      views: views,
      tags: tags,
      upvote: 0,
      downvote: 0,
      user: user,
      comments: [],
    });
    await newQuestion.save();

    await UserModel.findByIdAndUpdate(
      user,
      { $push: { questions: newQuestion._id } },
      { new: true }
    );

    console.log(newQuestion);

    return res.json({ question: newQuestion });
  } catch (error) {
    console.error("Failed to add question:", error);
  }
});

app.post("/questions/incrementViews", async function (req, res) {
  const { qid } = req.body; // Ensure that the qid (Question ID) is passed in the request body

  if (!qid) {
    return res.status(400).send({ message: "Question ID is required" });
  }

  try {
    // Find the question by ID and increment the views atomically
    const updatedQuestion = await question.findByIdAndUpdate(
      qid,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).send({ message: "Question not found" });
    }

    console.log(`Views incremented for question ID ${qid}`);
    return res.send({ question: updatedQuestion });
  } catch (error) {
    console.error("Failed to increment views:", error);
    return res
      .status(500)
      .send({ message: "Server error while updating views" });
  }
});

app.post("/add_answer", async (req, res) => {
  const {
    text,
    ans_by,
    ans_date_time,
    selectedQuestion,
    upvote,
    downvote,
    user,
  } = req.body;

  const newAnswer = new answer({
    text: text,
    ans_by: ans_by,
    ans_date_time: ans_date_time,
    selectedQuestion: selectedQuestion,
    upvote: upvote,
    downvote: downvote,
    user: user,
    comments: [],
  });

  console.log(ans_by);
  console.log(user);

  const savedAnswer = await newAnswer.save();

  const updatedQuestion = await question.findByIdAndUpdate(
    selectedQuestion._id,
    { $push: { answers: savedAnswer._id } },
    { new: true }
  );

  await UserModel.findByIdAndUpdate(
    user,
    { $push: { answers: savedAnswer._id } },
    { new: true }
  );

  if (!updatedQuestion) {
    return res.json({ message: "Question not found" });
  }

  res.json({ answer: savedAnswer, question: updatedQuestion });
});

const bcrypt = require("bcryptjs");

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  console.log("Registration request:", req.body);
  try {
    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const newUser = new UserModel({
      username,
      email,
      password,
    });

    const savedUser = await newUser.save();

    console.log(
      `User registered successfully: ${savedUser.username} with id: ${savedUser._id}`
    );

    console.log(`Password is hashed: ${savedUser.password.startsWith("$2a$")}`);

    res.status(201).json({
      message: "User registered successfully!",
      user: { id: savedUser._id, username: savedUser.username },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res
      .status(500)
      .json({ message: "Error registering new user.", error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is not set. Please configure environment variables."
      );
      process.exit(1); // Exit if no JWT secret is set
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, { httpOnly: true, secure: true });
    res.status(200).json({ message: "Logged in successfully!" });
  } catch (error) {
    console.error("Error during login:", error.stack);
    res.status(500).json({ message: "Login error.", error: error.message });
  }
});

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized access. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized access. Invalid token." });
  }
};

app.get("/protected-route", authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res
      .status(200)
      .json({ message: "Access to protected data successful.", user: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error accessing protected data." });
  }
});

// Handle both increment and decrement of upvotes
app.post("/questions/upvote", async (req, res) => {
  const { increment, qid } = req.body; // Expect a boolean value to determine increment or decrement
  const change = increment; // Determine increment or decrement based on the request

  let reputationUpdate = 5;
  try {
    const updatedQuestion = await question.findByIdAndUpdate(
      qid,
      { $inc: { upvote: change } },
      { new: true }
    );

    console.log(updatedQuestion._id);

    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedQuestion.user,
      { $inc: { reputation: reputationUpdate } },
      { new: true }
    );

    console.log(updatedUser);
    res.json(updatedQuestion, updatedUser);
  } catch (error) {
    res.status(500).send({ message: "Error updating upvote." });
  }
});

// Handle both increment and decrement of downvotes
app.post("/questions/downvote", async (req, res) => {
  const { increment, qid } = req.body; // Expect a boolean value to determine increment or decrement
  const change = increment; // Determine increment or decrement based on the request

  let reputationUpdate = -10;

  try {
    const updatedQuestion = await question.findByIdAndUpdate(
      qid,
      { $inc: { downvote: change } },
      { new: true }
    );

    console.log(updatedQuestion._id);

    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedQuestion.user,
      { $inc: { reputation: reputationUpdate } },
      { new: true }
    );

    console.log(updatedUser);
    res.json(updatedQuestion, updatedUser);
  } catch (error) {
    res.status(500).send({ message: "Error updating downvote." });
  }
});

app.post("/answers/upvote", async (req, res) => {
  const { increment, qid } = req.body; // Expect a boolean value to determine increment or decrement
  const change = increment; // Determine increment or decrement based on the request

  let reputationUpdate = 5;

  try {
    const updatedAnswer = await answer.findByIdAndUpdate(
      qid,
      { $inc: { upvote: change } },
      { new: true }
    );

    console.log(updatedAnswer._id);
    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedAnswer.user,
      { $inc: { reputation: reputationUpdate } },
      { new: true }
    );

    console.log(updatedUser);
    res.json(updatedAnswer, updatedReputation);
  } catch (error) {
    res.status(500).send({ message: "Error updating upvote." });
  }
});

// Handle both increment and decrement of downvotes
app.post("/answers/downvote", async (req, res) => {
  const { increment, qid } = req.body;
  // Expect a boolean value to determine increment or decrement
  const change = increment; // Determine increment or decrement based on the request
  console.log(change);

  let reputationUpdate = -10;

  try {
    const updatedAnswer = await answer.findByIdAndUpdate(
      qid,
      { $inc: { downvote: change } },
      { new: true }
    );

    console.log(updatedAnswer._id);
    const updatedUser = await UserModel.findByIdAndUpdate(
      updatedAnswer.user,
      { $inc: { reputation: reputationUpdate } },
      { new: true }
    );

    console.log(updatedUser);
    res.json(updatedAnswer, updatedReputation);
  } catch (error) {
    res.status(500).send({ message: "Error updating downvote." });
  }
});

app.post("/comments/:type", async (req, res) => {
  const { content, parentID, userID, parent_type, commentBy } = req.body;

  if (req.params.type !== parent_type) {
    return res
      .status(400)
      .json({ message: "Type mismatch between parameter and body." });
  }

  try {
    const user = await UserModel.findById(userID); // Assume User model exists
    /*  if (!user || user.reputation < 50) {
      return res.status(403).json({ message: 'You need at least 50 reputation to add a comment.' });
    }*/

    const newComment = new Comment({
      content: content,
      parentID: parentID,
      userID: userID,
      parent_type: parent_type,
      commentBy: commentBy,
      upvotedBy: [],
    });

    await newComment.save();

    if (parent_type === "question") {
      await question.findByIdAndUpdate(
        parentID,
        { $push: { comments: newComment._id } },
        { new: true }
      );
    } else {
      await answer.findByIdAndUpdate(
        parentID,
        { $push: { comments: newComment._id } },
        { new: true }
      );
    }

    await UserModel.findByIdAndUpdate(
      userID,
      { $push: { comments: newComment._id } },
      { new: true }
    );

    console.log("comment added"), console.log(newComment);

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/comments/upvote/:commentId", async (req, res) => {
  const { userId } = req.body;

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).send("Comment not found");
    }

    const index = comment.upvotedBy.indexOf(userId);
    if (index === -1) {
      // User has not upvoted yet, add upvote
      comment.upvotedBy.push(userId);
      comment.votes += 1;
    } else {
      comment.upvotedBy.splice(index, 1);
      comment.votes -= 1;
    }

    await comment.save();
    res.json({ votes: comment.votes });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/comments/question/:questionId", async (req, res) => {
  try {
    console.log("in server side");

    const comments = await Comment.find({
      parentID: req.params.questionId,
      parent_type: "question",
    }).sort({ createdAt: -1 });
    if (comments == undefined) comments = [];

    console.log(comments);

    res.json(comments);
  } catch (error) {
    console.error("Error fetching question comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/comments/answer/:answerId", async (req, res) => {
  try {
    const comments = await Comment.find({
      parentID: req.params.answerId,
      parent_type: "answer",
    }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error("Error fetching answer comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/questions/:id", (req, res) => {
  console.log("in questions");
  console.log(req.params.id);
  question
    .findById(req.params.id)
    .then((single_question) => {
      if (!single_question) res.status(404).send("Question not found");
      else {
        res.json(single_question);
        console.log(single_question);
      }
    })
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/api/answers/:id", (req, res) => {
  console.log("in asnwers");
  console.log(req.params.id);
  answer
    .findById(req.params.id)
    .then((single_answer) => {
      if (!single_answer) res.status(404).send("Answer not found");
      else {
        res.json(single_answer);
        console.log(single_answer);
      }
    })
    .catch((err) => res.status(500).send("Server error"));
});

app.get("/api/tags/:id", (req, res) => {
  console.log("in tags");
  console.log(req.params.id);
  tag
    .findById(req.params.id)
    .then((single_tag) => {
      if (!single_tag) res.status(404).send("Tag not found");
      else {
        res.json(single_tag);
        console.log(single_tag);
      }
    })
    .catch((err) => res.status(500).send("Server error"));
});

app.put("/update_question/:qid", async (req, res) => {
  const { qid } = req.params;
  const { title, text, summary } = req.body;

  try {
    const updatedQuestion = await question.findByIdAndUpdate(
      qid,
      { $set: { title: title, text: text, summary: summary } },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (updatedQuestion) {
      res
        .status(200)
        .json({ message: "Question updated successfully", updatedQuestion });
    } else {
      res.status(404).send("Question not found");
    }
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).send("Error updating question");
  }
});

app.put("/update_answer/:aid", async (req, res) => {
  const { aid } = req.params;
  const { text } = req.body;

  try {
    const updatedAnswer = await answer.findByIdAndUpdate(
      aid,
      { $set: { text: text } },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (updatedAnswer) {
      res
        .status(200)
        .json({ message: "Answer updated successfully", updatedAnswer });
    } else {
      res.status(404).send("Answer not found");
    }
  } catch (error) {
    console.error("Error updating answer:", error);
    res.status(500).send("Error updating answer");
  }
});

app.delete("/api/questions/:questionId", async (req, res) => {
  const { questionId } = req.params;

  try {
    const questionToDelete = await question
      .findById(questionId)
      .populate("answers");
    if (!questionToDelete) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Delete related answers and comments
    for (let answer of questionToDelete.answers) {
      const user = await UserModel.findById(answer.user);
      if (user) {
        user.answers.pull(answer._id);
        await user.save();
        console.log(`Removed answer ${answer._id} from user ${user._id}`);
      }

      for (let commentId of answer.comments) {
        const commentUser = await UserModel.findOne({ comments: commentId });
        if (commentUser) {
          commentUser.comments.pull(commentId);
          await commentUser.save();
          console.log(
            `Removed comment ${commentId} from user ${commentUser._id}`
          );
        }
        await Comment.findByIdAndDelete(commentId);
        console.log(`Deleted comment ${commentId}`);
      }

      await answer.findByIdAndDelete(answer._id);
      console.log(`Deleted answer ${answer._id}`);
    }

    // Delete related comments directly tied to the question
    for (let commentId of questionToDelete.comments) {
      const comment = await Comment.findById(commentId);
      if (comment) {
        const commentUser = await UserModel.findById(comment.user);
        if (commentUser) {
          commentUser.comments.pull(commentId);
          await commentUser.save();
          console.log(
            `Removed question-related comment ${commentId} from user ${commentUser._id}`
          );
        }
        await Comment.findByIdAndDelete(commentId);
        console.log(`Deleted question-related comment ${commentId}`);
      }
    }

    // Manage tags used by the question
    for (let tagId of questionToDelete.tags) {
      const otherQuestion = await question.findOne({
        _id: { $ne: questionId },
        tags: tagId,
      });
      if (!otherQuestion) {
        const usersWithThisTag = await UserModel.find({ tags: tagId });
        for (let user of usersWithThisTag) {
          const otherUserQuestions = await question.find({
            user: user._id,
            tags: tagId,
            _id: { $ne: questionId },
          });
          if (!otherUserQuestions.length) {
            user.tags.pull(tagId);
            await user.save();
            console.log(`Removed tag ${tagId} from user ${user._id}`);
          }
        }
        await tag.findByIdAndDelete(tagId);
        console.log(`Deleted tag ${tagId}`);
      }
    }

    const questionUser = await UserModel.findById(questionToDelete.user);
    if (questionUser) {
      questionUser.questions.pull(questionId);
      await questionUser.save();
      console.log(
        `Removed question ${questionId} from user ${questionUser._id}`
      );
    }

    // Finally, delete the question itself
    await question.findByIdAndDelete(questionId);
    console.log(`Deleted question ${questionId}`);

    res
      .status(200)
      .json({ message: "Question and related data deleted successfully." });
  } catch (error) {
    console.error("Failed to delete question:", error);
    res.status(500).json({
      message: "Error deleting question. Please try again.",
      error: error.message,
    });
  }
});

app.delete("/api/tags/:id", async (req, res) => {
  const tagId = req.params.id;

  try {
    // Find all questions using this tag
    const questionsUsingTag = await question
      .find({ tags: tagId })
      .populate("user");

    if (questionsUsingTag.length === 0) {
      // If no questions are using this tag, delete it
      await tag.findByIdAndDelete(tagId);
      return res.status(200).send({ message: "Tag deleted successfully.12" });
    }

    // Extract user IDs and check if only one unique user is using this tag
    const userIdsUsingTag = questionsUsingTag.map((question) =>
      question.user._id.toString()
    );
    const uniqueUserIds = [...new Set(userIdsUsingTag)];

    if (uniqueUserIds.length === 1) {
      // Remove tag from this user's profile and all their questions
      await UserModel.findByIdAndUpdate(uniqueUserIds[0], {
        $pull: { tags: tagId },
      });
      await question.updateMany(
        { user: uniqueUserIds[0], tags: tagId },
        { $pull: { tags: tagId } }
      );
      await tag.findByIdAndDelete(tagId);
      return res
        .status(200)
        .send({ message: "Tag deleted and all references removed." });
    } else {
      // Tag is used by multiple users, do not delete it
      return res
        .status(201)
        .send({ message: "Tag is used by other users and cannot be deleted." });
    }
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return res
      .status(500)
      .send({ message: "Error deleting tag. Please try again." });
  }
});

app.delete("/api/answers/:id", async (req, res) => {
  const answerId = req.params.id;

  try {
    // Step 1: Identify and access all comments linked to the answer
    const answer2 = await answer.findById(answerId).populate("comments");
    if (!answer2) {
      return res.status(404).send({ message: "Answer not found" });
    }

    // Update commenting users and delete comments
    const commentIds = answer2.comments.map((comment) => comment._id);
    await Promise.all(
      answer2.comments.map(async (comment) => {
        await UserModel.findByIdAndUpdate(comment.userID, {
          $pull: { comments: comment._id },
        });
      })
    );
    await Comment.deleteMany({ _id: { $in: commentIds } });

    // Step 2: Update the user who posted the answer
    await UserModel.findByIdAndUpdate(answer2.user, {
      $pull: { answers: answer2._id },
    });

    // Step 3: Update the associated question
    const question2 = await question.findOne({ answers: answer2._id });
    if (question2) {
      await question.findByIdAndUpdate(question2._id, {
        $pull: { answers: answer2._id },
      });
    }

    // Delete the answer
    await answer.findByIdAndDelete(answerId);

    res.status(200).send({
      message: "Answer and associated comments deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete answer:", error);
    res
      .status(500)
      .send({ message: "Error deleting answer. Please try again." });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  const { id: userId } = req.params; // Ensure that you're using `id` from params correctly, not `userId`

  try {
    const userToDelete = await UserModel.findById(userId);
    if (!userToDelete) {
      return res.status(404).send({ message: "User not found" });
    }

    const questions = await question
      .find({ user: userId })
      .populate("answers tags");
    for (const question1 of questions) {
      for (const answer1 of question1.answers) {
        const comments = await Comment.find({ parentID: answer1._id });
        for (const comment of comments) {
          await UserModel.findByIdAndUpdate(comment.userID, {
            $pull: { comments: comment._id },
          });
          await Comment.findByIdAndDelete(comment._id);
        }
        await UserModel.findByIdAndUpdate(answer1.user, {
          $pull: { answers: answer1._id },
        });
        await question.findByIdAndUpdate(question1._id, {
          $pull: { answers: answer1._id },
        });
        await answer.findByIdAndDelete(answer1._id);
      }
      for (const commentId of question1.comments) {
        const comment = await Comment.findById(commentId);
        await UserModel.findByIdAndUpdate(comment.userID, {
          $pull: { comments: commentId },
        });
        await Comment.findByIdAndDelete(commentId);
      }
      for (const tag1 of question1.tags) {
        const otherQuestions = await question.find({
          tags: tag1._id,
          _id: { $ne: question1._id },
        });
        if (!otherQuestions.length) {
          await UserModel.updateMany(
            { tags: tag1._id },
            { $pull: { tags: tag1._id } }
          );
          await tag.findByIdAndDelete(tag1._id);
        }
      }
      await question.findByIdAndDelete(question1._id);
    }

    await UserModel.findByIdAndDelete(userId);
    console.log(`User ${userId} and all related data deleted successfully.`);

    res
      .status(200)
      .json({ message: "User and all related data deleted successfully." });
  } catch (error) {
    console.error("Failed to delete user and related data:", error);
    res.status(500).json({
      message: "Error deleting user. Please try again.",
      error: error.message,
    });
  }
});
