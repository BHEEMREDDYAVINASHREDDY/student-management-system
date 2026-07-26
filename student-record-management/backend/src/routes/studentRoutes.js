const express = require('express');
const {
  createStudent, getStudents, getStudent, updateStudent, deleteStudent,
  uploadAvatar, exportStudentsCsv, importStudentsCsv,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createStudentRules, updateStudentRules } = require('../validators/studentValidators');
const { upload, csvUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.use(protect);

router.get('/export/csv', authorize('admin'), exportStudentsCsv);
router.post('/import/csv', authorize('admin'), csvUpload.single('file'), importStudentsCsv);

router
  .route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudentRules, validate, createStudent);

router
  .route('/:id')
  .get(getStudent)
  .put(authorize('admin'), updateStudentRules, validate, updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.put('/:id/avatar', upload.single('avatar'), uploadAvatar);

module.exports = router;
