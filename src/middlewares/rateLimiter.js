const rateLimit = require('express-rate-limit');

const limiters = {};

// User

limiters.User = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

limiters.signin = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
});

limiters.signUp = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
});

limiters.deleteUser = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
});

// follow

limiters.getFollowers = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

limiters.followTo = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

limiters.unFollowTo = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
});

// Post

limiters.getPost = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

limiters.createPost = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 50,
});

limiters.updatePost = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
});

limiters.updateState = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 50,
});

limiters.deletePost = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

limiters.postInteract = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

// image

limiters.uploadMedia = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 300,
});

// Posts

limiters.getPosts = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 500,
});

// Up Likes

limiters.getLikes = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
});

limiters.likes = rateLimit({
  windowMs: 20 * 60 * 1000,
  max: 300,
});

module.exports = limiters;
