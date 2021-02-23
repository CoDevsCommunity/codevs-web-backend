const Express = require('express');

const userController = require('../controllers/user.controller');
const followController = require('../controllers/follow.controller');

const tokenVerify = require('../middlewares/tokenVerify');

const router = Express.Router();

router
  .route('/user')
  .put(userController.getUser)
  .get(userController.signin)
  .post(userController.signUp)
  .delete(tokenVerify, userController.deleteUser);

router
  .route('/follow')
  .get(followController.getFollowers)
  .post(tokenVerify, followController.followTo)
  .delete(tokenVerify, followController.unFollowTo);

module.exports = router;
