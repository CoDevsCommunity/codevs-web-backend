/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const User = require('../database/models/User');

/**
 *
 * @param {Request} req Express Request
 * @param {Response} res Express Response
 * @param {const('express').NextFunction} next Express Response
 * @returns
 */

module.exports = async (req, res, next) => {
  try {
    const token = String(req.headers['access-token']);

    if (!token)
      return res.status(401).json({
        message: 'token not provided',
      });

    const jwtDecoded = jwt.verify(token, process.env.SECRET_KEY);

    const UserFound = User.findById(jwtDecoded.id);

    if (req.body.email) {
      if (
        (await User.findOne({ email: req.body.email }))._id.toString() !==
        jwtDecoded._id
      ) {
        return res.status(406).json({
          message:
            'Humm, Wow it seems that the Token you have is not equal to the user with which you are trying to perform actions, email',
        });
      }
    }

    if (req.body.userId) {
      // eslint-disable-next-line no-underscore-dangle
      if (
        (await User.findOne({ _id: req.body.userId }))._id.toString() !==
        jwtDecoded._id
      ) {
        return res.status(406).json({
          message:
            'Humm, Wow it seems that the Token you have is not equal to the user with which you are trying to perform actions, userId',
        });
      }
    }

    if (!UserFound)
      return res.status(404).json({
        message: 'User not exists',
      });
    req.token = jwtDecoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
