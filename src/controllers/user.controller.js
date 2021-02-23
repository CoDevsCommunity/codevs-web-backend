const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

const userController = {};

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
    const UserFound = await User.findOne({ username });
    if (UserFound === null) {
      return res.status(404).json({
        message: 'user not exists',
      });
    }

    const UserGet = await User.findOne({ username }).select('-password');

    return res.status(200).json({
      data: UserGet,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Internal Server Error, Try again.',
    });
  }
};

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
      return res.status(404).json({
        message: 'user not exists',
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
    const {
      username,
      firstName,
      lastName,
      avatarUrl,
      email,
      password,
    } = req.body;

    if (
      !username ||
      !firstName ||
      !lastName ||
      !avatarUrl ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        message: 'Bad Request, Username, Avatar URL or password is not valid',
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
      socialMedia: {
        avatarUrl,
      },
      password: await User.encryptPassword(password),
    });

    await userCreated.save();

    return res.status(201).json({
      message: 'Success',
      data: userCreated,
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

userController.deleteUser = async (req, res) => {
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

    console.log('User Exists');
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

module.exports = userController;
