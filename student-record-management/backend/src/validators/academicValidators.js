const { body } = require('express-validator');

const departmentRules = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('code').trim().notEmpty().withMessage('Department code is required'),
];

const courseRules = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('code').trim().notEmpty().withMessage('Course code is required'),
  body('department').isMongoId().withMessage('A valid department is required'),
  body('durationYears').isInt({ min: 1, max: 6 }),
  body('totalSemesters').isInt({ min: 1, max: 12 }),
];

const subjectRules = [
  body('name').trim().notEmpty().withMessage('Subject name is required'),
  body('code').trim().notEmpty().withMessage('Subject code is required'),
  body('course').isMongoId().withMessage('A valid course is required'),
  body('semester').isMongoId().withMessage('A valid semester is required'),
  body('credits').isInt({ min: 1, max: 10 }),
];

const semesterRules = [
  body('name').trim().notEmpty().withMessage('Semester name is required'),
  body('number').isInt({ min: 1, max: 12 }),
  body('course').isMongoId().withMessage('A valid course is required'),
];

module.exports = { departmentRules, courseRules, subjectRules, semesterRules };
