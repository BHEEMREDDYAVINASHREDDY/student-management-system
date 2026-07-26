const jwt = require('jsonwebtoken');
const config = require('../config/config');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwtCookieExpiresDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: 'lax',
  };

  res.cookie('token', token, cookieOptions);

  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject ? user.toSafeObject() : user,
  });
};

module.exports = { generateToken, sendTokenResponse };
