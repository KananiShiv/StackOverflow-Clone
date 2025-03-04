const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
  title: { type: String, required: true, maxlength: 100 },
  text: { type: String, required: true },
  summary:{ type: String, required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' , required:true}],
  answers: [{ type: Schema.Types.ObjectId, ref: 'Answer' }],
  asked_by: { type: String, default: 'Anonymous' },
  ask_date_time: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
  upvote:{type: Number, default: 0 },
  downvote:{type: Number, default: 0 },
  user:{type: Schema.Types.ObjectId},
  comments:[{type: Schema.Types.ObjectId}]
});

questionSchema.virtual('url').get(function () {
  return `posts/question/${this._id}`;
});

const Question = mongoose.model('Question', questionSchema);
module.exports = Question;
