const asyncHandler = require('express-async-handler');
const Marks = require('../models/Marks');
const Teacher = require('../models/Teacher');

// Standard 10-point grading scale used across the grade calculator and reports
const getGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'A+', gradePoint: 10 };
  if (percentage >= 80) return { grade: 'A', gradePoint: 9 };
  if (percentage >= 70) return { grade: 'B+', gradePoint: 8 };
  if (percentage >= 60) return { grade: 'B', gradePoint: 7 };
  if (percentage >= 50) return { grade: 'C', gradePoint: 6 };
  if (percentage >= 40) return { grade: 'D', gradePoint: 5 };
  return { grade: 'F', gradePoint: 0 };
};

const createOrUpdateMarks = asyncHandler(async (req, res) => {
  const { student, subject, semester, examType, marksObtained, maxMarks, remarks } = req.body;

  const teacher = await Teacher.findOne({ user: req.user._id });
  const gradedBy = req.user.role === 'admin' ? req.body.gradedBy : teacher?._id;

  if (!gradedBy) {
    res.status(400);
    throw new Error('gradedBy (teacher) is required');
  }

  const record = await Marks.findOneAndUpdate(
    { student, subject, examType },
    { student, subject, semester, examType, marksObtained, maxMarks, gradedBy, remarks },
    { new: true, upsert: true, runValidators: true }
  ).populate('subject', 'name code maxMarks passingMarks');

  res.status(200).json({ success: true, data: record });
});

const getMarks = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.semester) filter.semester = req.query.semester;

  const records = await Marks.find(filter).populate('subject', 'name code');
  res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc    Compute a student's GPA / result summary for a semester
// @route   GET /api/marks/report/:studentId/:semesterId
// @access  Private
const getSemesterReport = asyncHandler(async (req, res) => {
  const { studentId, semesterId } = req.params;

  const records = await Marks.find({ student: studentId, semester: semesterId }).populate(
    'subject',
    'name code credits passingMarks'
  );

  // Aggregate marks by subject (final exam counts most heavily if present, else average of components)
  const bySubject = {};
  records.forEach((r) => {
    const key = String(r.subject._id);
    if (!bySubject[key]) bySubject[key] = { subject: r.subject, entries: [] };
    bySubject[key].entries.push(r);
  });

  const subjectResults = Object.values(bySubject).map(({ subject, entries }) => {
    const finalEntry = entries.find((e) => e.examType === 'final');
    const chosen = finalEntry || entries[entries.length - 1];
    const percentage = (chosen.marksObtained / chosen.maxMarks) * 100;
    const { grade, gradePoint } = getGrade(percentage);
    return {
      subject: subject.name,
      code: subject.code,
      credits: subject.credits,
      percentage: Number(percentage.toFixed(2)),
      grade,
      gradePoint,
      passed: percentage >= ((subject.passingMarks / 100) * 100 || 40),
    };
  });

  const totalCredits = subjectResults.reduce((sum, s) => sum + s.credits, 0);
  const weightedPoints = subjectResults.reduce((sum, s) => sum + s.gradePoint * s.credits, 0);
  const gpa = totalCredits ? Number((weightedPoints / totalCredits).toFixed(2)) : 0;

  res.status(200).json({
    success: true,
    data: { subjectResults, gpa, totalCredits, resultStatus: subjectResults.every((s) => s.passed) ? 'PASS' : 'FAIL' },
  });
});

const deleteMarks = asyncHandler(async (req, res) => {
  const record = await Marks.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Marks record not found');
  }
  res.status(200).json({ success: true, message: 'Marks record deleted' });
});

module.exports = { createOrUpdateMarks, getMarks, getSemesterReport, deleteMarks, getGrade };
