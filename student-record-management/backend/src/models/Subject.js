const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', default: null },
    maxMarks: { type: Number, default: 100 },
    passingMarks: { type: Number, default: 40 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
