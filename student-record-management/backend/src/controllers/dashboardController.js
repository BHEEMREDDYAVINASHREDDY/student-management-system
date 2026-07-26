const asyncHandler = require('express-async-handler');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');

// @desc    Aggregate stats + chart-ready data for the admin dashboard
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminStats = asyncHandler(async (req, res) => {
  const [studentCount, teacherCount, departmentCount, courseCount] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Department.countDocuments(),
    Course.countDocuments(),
  ]);

  const studentsByDepartment = await Student.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'department' } },
    { $unwind: '$department' },
    { $project: { _id: 0, department: '$department.name', count: 1 } },
  ]);

  const studentsByStatus = await Student.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
  ]);

  const enrollmentTrend = await Student.aggregate([
    { $group: { _id: '$batchYear', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, year: '$_id', count: 1 } },
  ]);

  const attendanceOverall = await Attendance.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
      },
    },
  ]);
  const attendanceRate = attendanceOverall[0]
    ? Number(((attendanceOverall[0].present / attendanceOverall[0].total) * 100).toFixed(2))
    : 0;

  res.status(200).json({
    success: true,
    data: {
      counts: { studentCount, teacherCount, departmentCount, courseCount },
      studentsByDepartment,
      studentsByStatus,
      enrollmentTrend,
      attendanceRate,
    },
  });
});

// @desc    Dashboard data scoped to the logged-in teacher (their subjects/classes)
// @route   GET /api/dashboard/teacher
// @access  Private/Teacher
const getTeacherStats = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id }).populate('subjects');
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher profile not found');
  }

  const subjectIds = teacher.subjects.map((s) => s._id);
  const studentCount = await Student.countDocuments({ currentSemester: { $in: teacher.subjects.map((s) => s.semester) } });

  const recentMarks = await Marks.find({ subject: { $in: subjectIds } })
    .sort('-createdAt').limit(10).populate('subject', 'name code');

  res.status(200).json({
    success: true,
    data: { subjectCount: subjectIds.length, studentCount, recentMarks },
  });
});

// @desc    Dashboard data scoped to the logged-in student
// @route   GET /api/dashboard/student
// @access  Private/Student
const getStudentStats = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ user: req.user._id }).populate('currentSemester course department');
  if (!student) {
    res.status(404);
    throw new Error('Student profile not found');
  }

  const attendanceAgg = await Attendance.aggregate([
    { $match: { student: student._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
      },
    },
  ]);
  const attendanceRate = attendanceAgg[0]
    ? Number(((attendanceAgg[0].present / attendanceAgg[0].total) * 100).toFixed(2))
    : 0;

  const marks = await Marks.find({ student: student._id }).populate('subject', 'name code');

  res.status(200).json({ success: true, data: { student, attendanceRate, marks } });
});

module.exports = { getAdminStats, getTeacherStats, getStudentStats };
