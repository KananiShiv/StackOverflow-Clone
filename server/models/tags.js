const mongoose = require('mongoose');
const { Schema } = mongoose;

const tagSchema = new Schema({
  name: { type: String, required: true },
  user_id: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

tagSchema.virtual('url').get(function () {
  return `posts/tag/${this._id}`;
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
