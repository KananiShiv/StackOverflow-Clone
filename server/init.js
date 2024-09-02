// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const Tag = require("./models/tags");
const Question = require("./models/questions");
const Answer = require("./models/answers");
const Comment = require("./models/comments");
const { CardMembership } = require("@mui/icons-material");

const mongoDB = process.argv[2] || "mongodb://127.0.0.1:27017/fake_so";

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

async function createUser(
  username,
  email,
  password,
  role = "user",
  reputation
) {
  let user = await User.findOne({ username: username });
  if (user) {
    console.log("User already exists:", username);
    return user;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user = new User({
    username,
    email,
    password: hashedPassword,
    role,
    questions: [],
    answers: [],
    tags: [],
    comments: [],
    reputation: reputation,
  });
  console.log("User created:", user);
  return user.save();
}

async function createTag(name, user_id) {
  let tag = new Tag({ name: name, user_id: user_id });
  await tag.save();
  return tag;
}

async function createcomment(
  commentBy,
  parent_type,
  parentID,
  userID,
  content,
  votes,
  upvotedBy
) {
  const comment = new Comment({
    commentBy,
    parent_type,
    parentID,
    userID,
    content,
    votes,
    upvotedBy,
  });
  await comment.save();
  return comment;
}

async function createQuestion(
  title,
  text,
  summary,
  tags,
  answers,
  asked_by,
  userId,
  comments
) {
  const question = new Question({
    title,
    text,
    summary,
    tags,
    answers,
    asked_by,
    views: 0,
    upvote: 0,
    downvote: 0,
    user: userId,
  });
  await question.save();
  return question;
}

async function createAnswer(text, ans_by, userId) {
  const answer = new Answer({
    text,
    ans_by,
    upvote: 0,
    downvote: 0,
    user: userId,
    selectedQuestion: null,
    comments: [],
  });
  await answer.save();
  return answer;
}

/*async function addAllQuestionsAndAnswersToUsers() {
  const allQuestions = await Question.find(); 
  const allAnswers = await Answer.find(); 
  const users = await User.find(); 

  
  await Promise.all(users.map(async user => {
    user.questions = allQuestions.map(q => q._id);
    user.answers = allAnswers.map(a => a._id);
    await user.save();
  }));

  console.log("All questions and answers have been added to all users.");
}*/

async function init() {
  try {
    const adminUser = await createUser(
      "adminUser",
      "admin@example.com",
      "admin123",
      "admin",
      100
    );
    const regularUser = await createUser(
      "regularUser",
      "user@example.com",
      "user123",
      "user",
      100
    );

    const reactTag = await createTag("React", adminUser._id);
    const jsTag = await createTag("JavaScript", adminUser._id);
    const androidTag = await createTag("Android Studio", adminUser._id);
    const sharedPrefsTag = await createTag("Shared Preferences", adminUser._id);

    const answer1 = await createAnswer(
      "This is an answer about using React Router.",
      regularUser._id,
      regularUser._id
    );
    const answer2 = await createAnswer(
      "Here is how you can use Shared Preferences in Android.",
      regularUser._id,
      regularUser._id
    );
    const question1 = await createQuestion(
      "How to use React Router?",
      "Can anyone explain how to use React Router in a web application?",
      "The question seeks guidance on how to implement React Router in a web application. The individual asking is likely looking for an overview of integrating and using React Router. ",
      [reactTag._id, jsTag._id],
      [answer1._id],
      adminUser._id,
      adminUser._id
    );
    const question2 = await createQuestion(
      "Saving data with Shared Preferences",
      "What is the best practice for saving user settings in Android Studio using Shared Preferences?",
      "The question is asking for best practices for saving user settings in Android applications developed using Android Studio, specifically through the use of Shared Preferences.",
      [androidTag._id, sharedPrefsTag._id],
      [answer2._id],
      adminUser._id,
      adminUser._id,
      []
    );

    const comment1 = await createcomment(
      regularUser.username,
      "question",
      question1._id,
      regularUser._id,
      "Hello",
      0,
      []
    );
    adminUser.questions = [question1, question2];
    adminUser.tags = [reactTag, jsTag, androidTag, sharedPrefsTag];
    regularUser.answers = [answer1, answer2];
    regularUser.comments = [comment1];

    answer1.selectedQuestion = question1._id;
    answer2.selectedQuestion = question2._id;

    question1.comments = [comment1];

    await adminUser.save();
    await regularUser.save();
    await answer1.save();
    await answer2.save();
    await question1.save();

    console.log("Database initialized with sample data!");
  } catch (error) {
    console.error("Failed to initialize the database:", error);
  } finally {
    db.close();
  }
}

init();
