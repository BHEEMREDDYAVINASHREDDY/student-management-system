const express = require('express');
const { createSemester, getSemesters, getSemester, updateSemester, deleteSemester } = require('../controllers/semesterController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { semesterRules } = require('../validators/academicValidators');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSemesters)
  .post(authorize('admin'), semesterRules, validate, createSemester);

router
  .route('/:id')
  .get(getSemester)
  .put(authorize('admin'), updateSemester)
  .delete(authorize('admin'), deleteSemester);

module.exports = router;
