/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-expressions */
const jwt = require('jsonwebtoken');
const User = require('../../database/models/User');
const Post = require('../../database/models/Post');

const userController = {};

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @returns
 */

userController.getUsers = async (req, res) => {
  try {
    const usersFound = await User.find({}).select('-password -email');

    return res.status(200).json({
      message: 'success',
      data: usersFound,
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

userController.getUser = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({
        message: 'Bad Request, please provided username',
      });
    }

    const userFound = await User.findOne({ username });

    if (userFound === null) {
      return res.status(404).json({
        message: 'user not exists, Please provide correct username',
      });
    }

    return res.status(200).json({
      message: 'success',
      data: userFound.select('-password -email'),
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

userController.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Bad Request, please provided email and password',
      });
    }
    const UserFound = await User.findOne({ email });
    if (UserFound === null) {
      return res.status(204).json({
        message: 'User not exists',
      });
    }

    const Matchpwd = await User.comparePassword(password, UserFound.password);

    if (!Matchpwd) {
      return res.status(401).json({
        message: 'Incorrect Password',
        token: null,
      });
    }

    const UserAccount = await User.findOne({ email }).select('-password');

    return res.status(200).json({
      data: UserAccount,
      token: jwt.sign(
        // eslint-disable-next-line no-underscore-dangle
        { _id: UserAccount._id },
        process.env.SECRET_KEY,
        {
          expiresIn: 592e6,
        }
      ),
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

userController.signUp = async (req, res) => {
  try {
    const { username, firstName, lastName, email, password } = req.body;
    if (!username || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        message:
          'Bad Request, Provide username, firstname, lastname, email and password.',
      });
    }

    if (!email.includes('.') || !email.includes('@')) {
      return res.status(406).json({
        message: 'The email provided does not meet the format, Try again.',
      });
    }

    const UserFound = await User.findOne({ email, username });
    if (UserFound != null) {
      return res.status(403).json({
        message: 'a user has already registered that username and email',
      });
    }

    const userCreated = new User({
      username,
      firstName,
      lastName,
      email,
      password: await User.encryptPassword(password),
    });
    await userCreated.save();
    const UserCreatedFound = await User.findOne({ email }).select('-password');

    return res.status(201).json({
      message: 'Success',
      data: UserCreatedFound,
      token: jwt.sign(
        // eslint-disable-next-line no-underscore-dangle
        { id: userCreated._id },
        process.env.SECRET_KEY,
        {
          expiresIn: 2.592e6,
        }
      ),
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

userController.removeUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Bad Request, please provided email and password',
      });
    }
    const UserFound = await User.findOne({ email });

    if (UserFound == null) {
      return res.status(200).json({
        message:
          'User Does not exist to be deleted, please specify correct user data',
      });
    }

    const Matchpwd = await User.comparePassword(password, UserFound.password);

    if (!Matchpwd) {
      return res.status(401).json({
        message: 'Incorrect Password',
      });
    }

    const UserAccount = await User.findOne({ email }).select('-password');

    UserFound.remove();

    console.log('User Deleted');
    return res.status(200).json({
      message: 'User Deleted',
      data: UserAccount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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

userController.updateUser = async (req, res) => {
  try {
    const {
      userId,
      username,
      firstName,
      lastName,
      bannerUrl,
      avatarUrl,
      twitterUrl,
      githubUrl,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'Bad Request, Provide userId',
      });
    }

    if (
      !username &&
      !firstName &&
      !lastName &&
      !bannerUrl &&
      !avatarUrl &&
      !twitterUrl &&
      !githubUrl
    ) {
      return res.status(426).json({
        message:
          'You must provide at least a value you want to update, username, firstName, lastName, bannerUrl, avatarUrl, twitterUrl or githubUrl',
      });
    }

    const UserFound = await User.findOne({ _id: userId });
    if (UserFound === null) {
      return res.status(403).json({
        message: 'user not exists, please provided correct userId',
      });
    }

    if (
      UserFound.username === username &&
      UserFound.firstName === firstName &&
      UserFound.lastName === lastName &&
      UserFound.bannerUrl === bannerUrl &&
      UserFound.avatarUrl === avatarUrl
    ) {
      return res.status(426).json({
        message:
          'It seems that you have not made any change to update the user, try again',
      });
    }

    const oldUsername = UserFound.username;

    if (username.length) {
      if (!oldUsername) {
        return res.status(400).json({
          message: 'Provide your previous username',
        });
      }
      // update all post author name by user
      await Post.updateMany(
        { author: oldUsername },
        {
          author: username,
        }
      );
    }

    await User.findOneAndUpdate(
      { _id: userId },
      {
        username,
        firstName: firstName || UserFound.firstName,
        lastName: lastName || UserFound.lastName,
        socialMedia: {
          bannerUrl: bannerUrl || UserFound.bannerUrl,
          avatarUrl: avatarUrl || UserFound.avatarUrl,
        },
        socialLinks: {
          twitterUrl: twitterUrl || UserFound.twitterUrl,
          githubUrl: githubUrl || UserFound.githubUrl,
        },
      }
    );

    // update all user posts comments
    const UserFoundComments = await User.findOne({ username }).select(
      '_id username socialMedia'
    );

    await Post.updateMany(
      {
        'comments.commenter.user.username': oldUsername,
      },
      {
        $set: {
          'comments.$.commenter.user': UserFoundComments,
        },
      }
    );

    const UserUpdatedFound = await User.findOne({ username }).select(
      '-password'
    );

    return res.status(201).json({
      message: 'Success',
      data: UserUpdatedFound,
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

userController.updateUserState = async (req, res) => {
  try {
    const { userId, state } = req.body;
    if (!userId || !state) {
      return res.status(400).json({
        message: 'Bad Request, Provide userId',
      });
    }

    const UserFound = await User.findOne({ _id: userId });

    if (UserFound === null) {
      return res.status(403).json({
        message: 'user not exists, please provided correct userId',
      });
    }

    const status = ['online', 'occupied', 'offline'];

    if (!status.includes(state)) {
      return res.status(406).json({
        message: `state not acceptable, [${status.join(', ')}]`,
      });
    }

    await User.findOneAndUpdate(
      { _id: userId },
      {
        state,
      }
    );

    const UserStateUpdatedFound = await User.findOne({ _id: userId }).select(
      '-password'
    );

    return res.status(201).json({
      message: 'Success',
      data: UserStateUpdatedFound,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

module.exports = userController;
