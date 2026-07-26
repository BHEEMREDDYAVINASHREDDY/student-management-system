const asyncHandler = require('express-async-handler');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');

const createSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.create(req.body);
  const populated = await semester.populate('course');
  res.status(201).json({ success: true, data: populated });
});

const getSemesters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  const semesters = await Semester.find(filter).populate('course').sort('number');
  res.status(200).json({ success: true, count: semesters.length, data: semesters });
});

const getSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id).populate('course');
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  const subjectCount = await Subject.countDocuments({ semester: semester._id });
  res.status(200).json({ success: true, data: { ...semester.toObject(), subjectCount } });
});

const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.status(200).json({ success: true, data: semester });
});

const deleteSemester = asyncHandler(async (req, res) => {
  const inUse = await Subject.countDocuments({ semester: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error('Cannot delete a semester that still has subjects assigned to it');
  }
  const semester = await Semester.findByIdAndDelete(req.params.id);
  if (!semester) {
    res.status(404);
    throw new Error('Semester not found');
  }
  res.status(200).json({ success: true, message: 'Semester deleted successfully' });
});

module.exports = { createSemester, getSemesters, getSemester, updateSemester, deleteSemester };
