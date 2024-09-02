const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new mongoose.Schema({
    commentBy:
    {
      type:String
    },
    parent_type:
    {
         type:String
    },
    parentID: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true, 
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true
    },
    votes: {
      type: Number,
      default: 0 
    },
    createdAt: {
      type: Date,
      default: Date.now 
    },

     upvotedBy:[{type: Schema.Types.ObjectId}]
       

  });
  
commentSchema.virtual('url').get(function () {
  return `posts/Comment/${this._id}`;
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
