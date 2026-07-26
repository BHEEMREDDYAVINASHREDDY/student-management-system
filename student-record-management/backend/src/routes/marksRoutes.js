const express = require('express');
const { createOrUpdateMarks, getMarks, getSemesterReport, deleteMarks } = require('../controllers/marksController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { marksRules } = require('../validators/marksValidators');

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'teacher'), marksRules, validate, createOrUpdateMarks);
router.get('/', getMarks);
router.get('/report/:studentId/:semesterId', getSemesterReport);
router.delete('/:id', authorize('admin', 'teacher'), deleteMarks);

module.exports = router;
