const express = require('express');
const {
  markBulkAttendance, getAttendance, getAttendanceSummary, deleteAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/bulk', authorize('admin', 'teacher'), markBulkAttendance);
router.get('/', getAttendance);
router.get('/summary/:studentId', getAttendanceSummary);
router.delete('/:id', authorize('admin', 'teacher'), deleteAttendance);

module.exports = router;
