const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
    // unique: true
  },
  description: {
    type: String,
    required: true
  },
  likes: {
    type: Number
  },
  authorName: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);