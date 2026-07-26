const express = require('express');
const { getAdminStats, getTeacherStats, getStudentStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/teacher', authorize('teacher'), getTeacherStats);
router.get('/student', authorize('student'), getStudentStats);

module.exports = router;
