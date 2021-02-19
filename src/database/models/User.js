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
    banner_url: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
  },
  socialLinks: {
    twitter_url: {
      type: String,
    },
    githubUrl: {
      type: String,
    },
  },
  following: [
    {
      user: {
        type: Object,
      },
    },
  ],
  followers: [
    {
      user: {
        type: Object,
      },
    },
  ],
  state: {
    type: String,
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
