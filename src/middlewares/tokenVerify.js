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

    if (!UserFound)
      return res.status(404).json({
        message: 'Username not exists',
      });

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }
};
