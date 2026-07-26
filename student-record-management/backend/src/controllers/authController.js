const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { sendTokenResponse } = require('../utils/generateToken');

// @desc    Register a new user (admin creates teacher/student accounts; public registration -> student only)
// @route   POST /api/auth/register
// @access  Public (role forced to 'student' unless requester is an authenticated admin)
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  let role = 'student';

  // Only an already-authenticated admin may create teacher/admin accounts directly
  if (req.user && req.user.role === 'admin' && req.body.role) {
    role = req.body.role;
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, role });
  sendTokenResponse(user, 201, res);
});

// @desc    Login with email + password
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact an administrator.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc    Logout - clears the auth cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 1000), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get the currently authenticated user, including linked Student/Teacher profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = req.user.toSafeObject();

  let profile = null;
  if (user.role === 'student') {
    profile = await Student.findOne({ user: user._id }).populate('course department currentSemester');
  } else if (user.role === 'teacher') {
    profile = await Teacher.findOne({ user: user._id }).populate('department subjects');
  }

  res.status(200).json({ success: true, user, profile });
});

// @desc    Update own password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

module.exports = { register, login, logout, getMe, updatePassword };
