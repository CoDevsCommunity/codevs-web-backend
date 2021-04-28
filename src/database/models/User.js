const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  socialMedia: {
    bannerUrl: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  socialLinks: {
    twitterUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
  },
  following: [
    {
      user: {
        type: Object,
        default: [],
      },
    },
  ],
  followers: [
    {
      user: {
        type: Object,
        default: [],
      },
    },
  ],
  upLikes: [
    {
      post: {
        type: Object,
        default: [],
      },
    },
  ],
  downLikes: [
    {
      post: {
        type: Object,
        default: [],
      },
    },
  ],
  publications: {
    type: Number,
    default: 0,
  },
  state: {
    type: String,
    default: 'online',
  },
  exp: {
    type: Number,
    default: 0,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  created_At: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.statics.encryptPassword = async (pwd) => {
  const salt = await bcrypt.genSalt(10);
  // eslint-disable-next-line no-return-await
  return await bcrypt.hash(pwd, salt);
};

UserSchema.statics.comparePassword = async (pwd, rpwd) =>
  // eslint-disable-next-line no-return-await
  await bcrypt.compare(pwd, rpwd);

module.exports = model('User', UserSchema);
