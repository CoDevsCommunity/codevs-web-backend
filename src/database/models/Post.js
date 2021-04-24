const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  upLikes: [
    {
      user: {
        type: Object,
        default: [],
      },
    },
  ],
  downLikes: [
    {
      user: {
        type: Object,
        default: [],
      },
    },
  ],
  views: [
    {
      user: {
        type: Object,
        default: [],
      },
    },
  ],
  comments: [
    {
      commenter: {
        user: {
          type: Object,
        },
        comment: {
          type: String,
        },
      },
    },
  ],
  state: {
    type: String,
    default: 'public',
  },
  update_At: {
    type: Date,
    default: Date.now,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model('Post', PostSchema);
