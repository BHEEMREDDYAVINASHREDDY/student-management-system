const express = require('express');
const { createSubject, getSubjects, getSubject, updateSubject, deleteSubject } = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { subjectRules } = require('../validators/academicValidators');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSubjects)
  .post(authorize('admin'), subjectRules, validate, createSubject);

router
  .route('/:id')
  .get(getSubject)
  .put(authorize('admin'), updateSubject)
  .delete(authorize('admin'), deleteSubject);

module.exports = router;
