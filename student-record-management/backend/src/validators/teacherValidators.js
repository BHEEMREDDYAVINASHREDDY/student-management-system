const { body } = require('express-validator');

const createTeacherRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('department').isMongoId().withMessage('A valid department is required'),
];

module.exports = { createTeacherRules };
