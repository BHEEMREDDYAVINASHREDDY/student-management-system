const express = require('express');
const { register, login, logout, getMe, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerRules, loginRules, updatePasswordRules } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePasswordRules, validate, updatePassword);

module.exports = router;
