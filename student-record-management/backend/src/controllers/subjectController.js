const asyncHandler = require('express-async-handler');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const ApiFeatures = require('../utils/apiFeatures');

const createSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.create(req.body);
  if (subject.teacher) {
    await Teacher.findByIdAndUpdate(subject.teacher, { $addToSet: { subjects: subject._id } });
  }
  const populated = await subject.populate('course semester teacher');
  res.status(201).json({ success: true, data: populated });
});

const getSubjects = asyncHandler(async (req, res) => {
  const total = await Subject.countDocuments();
  const features = new ApiFeatures(Subject.find().populate('course semester teacher'), req.query)
    .search(['name', 'code']).filter().sort().paginate();
  const subjects = await features.query;

  res.status(200).json({
    success: true, count: subjects.length, total,
    page: features.pagination.page, limit: features.pagination.limit, data: subjects,
  });
});

const getSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id).populate('course semester teacher');
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  res.status(200).json({ success: true, data: subject });
});

const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  const previousTeacher = subject.teacher;
  Object.assign(subject, req.body);
  await subject.save();

  if (String(previousTeacher) !== String(subject.teacher)) {
    if (previousTeacher) await Teacher.findByIdAndUpdate(previousTeacher, { $pull: { subjects: subject._id } });
    if (subject.teacher) await Teacher.findByIdAndUpdate(subject.teacher, { $addToSet: { subjects: subject._id } });
  }

  const populated = await subject.populate('course semester teacher');
  res.status(200).json({ success: true, data: populated });
});

const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }
  if (subject.teacher) {
    await Teacher.findByIdAndUpdate(subject.teacher, { $pull: { subjects: subject._id } });
  }
  await subject.deleteOne();
  res.status(200).json({ success: true, message: 'Subject deleted successfully' });
});

module.exports = { createSubject, getSubjects, getSubject, updateSubject, deleteSubject };
