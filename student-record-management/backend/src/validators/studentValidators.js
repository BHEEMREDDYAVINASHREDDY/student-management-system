const { body } = require('express-validator');

const createStudentRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
  body('course').isMongoId().withMessage('A valid course is required'),
  body('department').isMongoId().withMessage('A valid department is required'),
  body('currentSemester').isMongoId().withMessage('A valid semester is required'),
  body('batchYear').isInt({ min: 2000, max: 2100 }).withMessage('A valid batch year is required'),
];

const updateStudentRules = [
  body('email').optional().isEmail().withMessage('A valid email is required'),
  body('status').optional().isIn(['active', 'graduated', 'suspended', 'dropped']),
];

module.exports = { createStudentRules, updateStudentRules };
