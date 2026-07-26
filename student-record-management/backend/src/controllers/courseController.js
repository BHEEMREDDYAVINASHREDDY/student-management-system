const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Student = require('../models/Student');
const ApiFeatures = require('../utils/apiFeatures');

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
});

const getCourses = asyncHandler(async (req, res) => {
  const total = await Course.countDocuments();
  const features = new ApiFeatures(Course.find().populate('department'), req.query)
    .search(['name', 'code']).filter().sort().paginate();
  const courses = await features.query;

  res.status(200).json({
    success: true, count: courses.length, total,
    page: features.pagination.page, limit: features.pagination.limit, data: courses,
  });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('department');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const studentCount = await Student.countDocuments({ course: course._id });
  res.status(200).json({ success: true, data: { ...course.toObject(), studentCount } });
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.status(200).json({ success: true, data: course });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const inUse = await Student.countDocuments({ course: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error('Cannot delete a course that has enrolled students');
  }
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.status(200).json({ success: true, message: 'Course deleted successfully' });
});

module.exports = { createCourse, getCourses, getCourse, updateCourse, deleteCourse };
