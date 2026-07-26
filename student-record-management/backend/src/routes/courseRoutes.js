const express = require('express');
const { createCourse, getCourses, getCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { courseRules } = require('../validators/academicValidators');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getCourses)
  .post(authorize('admin'), courseRules, validate, createCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

module.exports = router;
