const express = require('express');
const {
  createTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher, uploadAvatar, exportTeachersCsv,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createTeacherRules } = require('../validators/teacherValidators');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/export/csv', authorize('admin'), exportTeachersCsv);

router
  .route('/')
  .get(authorize('admin'), getTeachers)
  .post(authorize('admin'), createTeacherRules, validate, createTeacher);

router
  .route('/:id')
  .get(getTeacher)
  .put(authorize('admin'), updateTeacher)
  .delete(authorize('admin'), deleteTeacher);

router.put('/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
