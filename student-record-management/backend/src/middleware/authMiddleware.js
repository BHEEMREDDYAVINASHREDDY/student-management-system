const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const config = require('../config/config');
const User = require('../models/User');

// Verifies the JWT (from Authorization header or cookie) and attaches req.user
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized, user no longer exists or is inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Not authorized, token failed or expired');
  }
});

// Restricts a route to specific roles, e.g. authorize('admin', 'teacher')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Role '${req.user ? req.user.role : 'unknown'}' is not permitted to access this resource`);
  }
  next();
};

module.exports = { protect, authorize };
