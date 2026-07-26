const asyncHandler = require('express-async-handler');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

// @desc    Mark attendance for one or more students at once
// @route   POST /api/attendance/bulk
// @body    { subject, date, records: [{ student, status, remarks }] }
// @access  Private/Teacher,Admin
const markBulkAttendance = asyncHandler(async (req, res) => {
  const { subject, date, records } = req.body;

  const teacher = await Teacher.findOne({ user: req.user._id });
  const markedBy = req.user.role === 'admin' ? req.body.markedBy : teacher?._id;

  if (!markedBy) {
    res.status(400);
    throw new Error('markedBy (teacher) is required');
  }

  const operations = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, subject, date },
      update: { $set: { status: r.status, remarks: r.remarks || '', markedBy } },
      upsert: true,
    },
  }));

  const result = await Attendance.bulkWrite(operations);
  res.status(200).json({ success: true, result });
});

// @desc    Get attendance records with optional filters
// @route   GET /api/attendance?student=&subject=&from=&to=
// @access  Private
const getAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.student) filter.student = req.query.student;
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.from || req.query.to) {
    filter.date = {};
    if (req.query.from) filter.date.$gte = new Date(req.query.from);
    if (req.query.to) filter.date.$lte = new Date(req.query.to);
  }

  const records = await Attendance.find(filter)
    .populate('subject', 'name code')
    .populate({ path: 'student', populate: { path: 'user', select: 'name' } })
    .sort('-date');

  res.status(200).json({ success: true, count: records.length, data: records });
});

// @desc    Get an attendance summary (percentage) for one student, optionally per subject
// @route   GET /api/attendance/summary/:studentId
// @access  Private
const getAttendanceSummary = asyncHandler(async (req, res) => {
  const match = { student: new (require('mongoose').Types.ObjectId)(req.params.studentId) };
  if (req.query.subject) match.subject = new (require('mongoose').Types.ObjectId)(req.query.subject);

  const summary = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$subject',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } },
      },
    },
    {
      $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subject' },
    },
    { $unwind: '$subject' },
    {
      $project: {
        subject: '$subject.name',
        total: 1,
        present: 1,
        percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2] },
      },
    },
  ]);

  res.status(200).json({ success: true, data: summary });
});

const deleteAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findByIdAndDelete(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error('Attendance record not found');
  }
  res.status(200).json({ success: true, message: 'Attendance record deleted' });
});

module.exports = { markBulkAttendance, getAttendance, getAttendanceSummary, deleteAttendance };
