const User = require('../database/models/User');

const followController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

followController.getFollowers = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        message: 'Bad Request, please provided username',
      });
    }
    const UserFound = await User.findOne({ username });
    if (UserFound === null) {
      return res.status(404).json({
        message: 'user not exists',
      });
    }

    const UserFollowers = await User.findOne({ username }).select('-password');

    if (!UserFound.$isValid('followers')) {
      console.log('Has no followers');
      return res.status(200).json({
        message: 'User has no followers',
      });
    }

    return res.status(200).json({
      data: UserFollowers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

followController.followTo = async (req, res) => {
  try {
    const { username, userToFollow } = req.body;
    if (!username || !userToFollow) {
      return res.status(400).json({
        message: 'Bad Request, Username and followTo is not valid',
      });
    }

    const UserFound = await User.findOne({ username: userToFollow });
    if (!UserFound || UserFound == null) {
      return res.status(200).json({
        message: 'User to follow not exists',
      });
    }

    const isFollowed = await User.findOne({ username }, async (err, user) => {
      if (
        user.followers.filter((follower) => follower.user.username === username)
      )
        return true;
      return false;
    });
    console.log(isFollowed);
    if (isFollowed) {
      return res.status(200).json({
        message: 'you are already following this user',
      });
    }

    const UserFollowing = await User.findOne({ username })
      .select('-password')
      .select('-email')
      .select('-following')
      .select('-followers');

    await User.updateOne(
      { username: userToFollow },
      {
        $push: {
          followers: {
            user: UserFollowing,
          },
        },
      }
    );

    const UserFollowedAdd = await User.findOne({ username: userToFollow })
      .select('-password')
      .select('-email')
      .select('-following')
      .select('-followers');

    await User.updateOne(
      { username },
      {
        $push: {
          following: {
            user: UserFollowedAdd,
          },
        },
      }
    );

    return res.status(201).json({
      message: 'Success',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

followController.unFollowTo = async (req, res) => {
  try {
    const { username, unfollowTo } = req.body;
    if (!username || !unfollowTo) {
      return res.status(400).json({
        message:
          'Bad Request, please provided username and unfollowTo username',
      });
    }
    const UserFound = await User.findOne({ username })
      .select('-email')
      .select('-password');

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'User Does not exist to be unfollow, please specify correct unFollowTo username',
      });
    }

    const isFollowed = await User.findOne({ username }, async (err, user) => {
      if (
        user.followers.filter((follower) => follower.user.username === username)
      )
        return true;
      return false;
    });

    if (!isFollowed) {
      return res.status(200).json({
        message: 'You are not following this user',
      });
    }

    const UserUnFollowing = await User.findOne({ username })
      .select('-password')
      .select('-email')
      .select('-following')
      .select('-followers');

    await User.updateOne(
      { username: unfollowTo },
      {
        $pull: {
          followers: {
            user: UserUnFollowing,
          },
        },
      }
    );

    const UserUnFollowedRemove = await User.findOne({ username: unfollowTo })
      .select('-password')
      .select('-email')
      .select('-following')
      .select('-followers');

    await User.updateOne(
      { username },
      {
        $pull: {
          following: {
            user: UserUnFollowedRemove,
          },
        },
      }
    );

    console.log('Follow Exists');

    return res.status(200).json({
      message: 'User UnFollowed',
      data: UserFound,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = followController;
