const { body } = require('express-validator');

const marksRules = [
  body('student').isMongoId().withMessage('A valid student is required'),
  body('subject').isMongoId().withMessage('A valid subject is required'),
  body('semester').isMongoId().withMessage('A valid semester is required'),
  body('examType').isIn(['quiz', 'assignment', 'midterm', 'final', 'practical']),
  body('marksObtained').isFloat({ min: 0 }),
  body('maxMarks').isFloat({ min: 1 }),
];

module.exports = { marksRules };
