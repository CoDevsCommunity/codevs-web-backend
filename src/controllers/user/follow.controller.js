const User = require('../../database/models/User');

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

    if (!UserFound.$isValid('followers')) {
      return res.status(200).json({
        message: 'User has no followers',
      });
    }

    return res.status(200).json({
      message: 'success',
      data: await User.findOne({ username }).select('-password'),
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
    const { userId, username, userToFollow } = req.body;
    if (!userId || !username || !userToFollow) {
      return res.status(400).json({
        message: 'Bad Request, provided userId, username and userToFollow',
      });
    }

    const getUserToFollow = await User.findOne({
      username: userToFollow,
    }).select('_id');
    if ((await User.findOne({ username })) === null) {
      return res.status(200).json({
        message: 'Bad Request, Username Not valid, it does not exist',
      });
    }
    if (getUserToFollow == null) {
      return res.status(200).json({
        message: 'User to follow not exists',
      });
    }

    if (getUserToFollow.username === username) {
      return res.status(200).json({
        message: 'You can not follow yourself',
      });
    }

    let isFollowed = false;
    await User.findOne({ username }, async (err, user) => {
      // eslint-disable-next-line no-unused-expressions
      user.following.find((follower) => follower.user.username === userToFollow)
        ? (isFollowed = true)
        : null;
    });
    if (isFollowed) {
      return res.status(200).json({
        message: 'you are already following this user',
      });
    }

    // Add the user who wants to follow followes

    await User.updateOne(
      { username },
      {
        $push: {
          following: {
            user: getUserToFollow,
          },
        },
      }
    );

    // Add follower to the user who will follow

    await User.updateOne(
      { username: userToFollow },
      {
        $push: {
          followers: {
            user: await User.findOne({ username }).select('_id'),
          },
        },
      }
    );

    return res.status(201).json({
      message: 'User Follow Success',
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
    const { userId, username, unfollowTo } = req.body;
    if (!userId || !username || !unfollowTo) {
      return res.status(400).json({
        message: 'Bad Request, provided userId, username and unfollowTo',
      });
    }
    const getUserToUnFollow = await User.findOne({
      username: unfollowTo,
    }).select('_id');

    if (getUserToUnFollow == null) {
      return res.status(200).json({
        message:
          'User Does not exist to be unfollow, please specify correct unFollowTo username',
      });
    }

    if (getUserToUnFollow.username === username) {
      return res.status(200).json({
        message: 'You can not unfollow yourself',
      });
    }

    let isFollowed = false;
    await User.findOne({ username }, async (err, user) => {
      if (user.following.length === 0) {
        return;
      }
      // eslint-disable-next-line no-unused-expressions
      user.following.find(
        (follower) => follower.user.username.toString() === unfollowTo
      )
        ? (isFollowed = true)
        : false;
    });
    if (!isFollowed) {
      return res.status(200).json({
        message: 'You are not following this user',
      });
    }

    const UserUnFollowing = await User.findOne({ username }).select('_id');

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

    await User.updateOne(
      { username },
      {
        $pull: {
          following: {
            user: await User.findOne({ username: unfollowTo }).select('_id'),
          },
        },
      }
    );

    return res.status(200).json({
      message: 'User UnFollowed Success',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = followController;
