const Express = require('express');

const userController = require('../controllers/user/user.controller');
const followController = require('../controllers/user/follow.controller');
const contactController = require('../controllers/contact.controller');
const tokenVerify = require('../middlewares/tokenVerify');

const postController = require('../controllers/post/post.controller');
const mediaController = require('../controllers/media.controller');
const likeController = require('../controllers/post/like.controller');
const rateLimiter = require('../middlewares/rateLimiter');

const router = Express.Router();

router
  .route('/user')
  .patch(rateLimiter.User, userController.getUser)
  .get(rateLimiter.signin, userController.signin)
  .post(rateLimiter.signUp, userController.signUp)
  .delete(rateLimiter.deleteUser, tokenVerify, userController.removeUser);

router.route('/user/edit').put(rateLimiter.User, userController.updateUser);

router
  .route('/user/state')
  .put(rateLimiter.User, userController.updateUserState);

router.route('/users').get(rateLimiter.User, userController.getUsers);

router
  .route('/follow')
  .get(rateLimiter.getFollowers, followController.getFollowers)
  .post(rateLimiter.followTo, tokenVerify, followController.followTo)
  .delete(rateLimiter.unFollowTo, tokenVerify, followController.unFollowTo);

router
  .route('/post')
  .get(rateLimiter.getPost, postController.getPost)
  .post(rateLimiter.createPost, tokenVerify, postController.createPost)
  .put(rateLimiter.updatePost, tokenVerify, postController.updatePost)
  .delete(rateLimiter.deletePost, tokenVerify, postController.removePost);

router.route('/posts').get(rateLimiter.getPosts, postController.getPosts);

router
  .route('/post/view')
  .post(rateLimiter.postInteract, tokenVerify, postController.addView);

router
  .route('/post/comment')
  .post(rateLimiter.postInteract, tokenVerify, postController.addComment)
  .put(rateLimiter.postInteract, tokenVerify, postController.updateComment)
  .delete(rateLimiter.postInteract, tokenVerify, postController.removeComment);

router.route('/post/likes').get(rateLimiter.getLikes, likeController.getLikes);

router
  .route('/post/likeUp')
  .post(rateLimiter.likes, tokenVerify, likeController.upLike)
  .delete(rateLimiter.likes, tokenVerify, likeController.removeUpLike);

router
  .route('/post/likeDown')
  .post(rateLimiter.likes, tokenVerify, likeController.downLike)
  .delete(rateLimiter.likes, tokenVerify, likeController.removeDownLike);

router
  .route('/post/state')
  .put(rateLimiter.updateState, tokenVerify, postController.updateState);

router
  .route('/uploadImage')
  .post(tokenVerify, rateLimiter.uploadMedia, mediaController.uploadImage);

router
  .route('/uploadFile')
  .post(tokenVerify, rateLimiter.uploadMedia, mediaController.uploadFile);

router.route('/contact').post(contactController.getInfo);

module.exports = router;
