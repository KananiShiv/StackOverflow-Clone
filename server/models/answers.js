const mongoose = require('mongoose');
const { Schema } = mongoose;

const answerSchema = new Schema({
  text: { type: String, required: true },
  ans_by: { type: String, default: 'Anonymous', required:true },
  ans_date_time: { type: Date, default: Date.now },
  selectedQuestion:{type: Schema.Types.ObjectId},
  upvote:{type: Number, default: 0 },
  downvote:{type: Number, default: 0 },
  user:{type: Schema.Types.ObjectId},
  comments:[{type: Schema.Types.ObjectId}]
});

answerSchema.virtual('url').get(function () {
  return `posts/answer/${this._id}`;
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
