const asyncHandler = require('express-async-handler');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ApiFeatures = require('../utils/apiFeatures');

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, data: department });
});

const getDepartments = asyncHandler(async (req, res) => {
  const total = await Department.countDocuments();
  const features = new ApiFeatures(
    Department.find().populate('headOfDepartment'),
    req.query
  ).search(['name', 'code']).filter().sort().paginate();
  const departments = await features.query;

  res.status(200).json({
    success: true, count: departments.length, total,
    page: features.pagination.page, limit: features.pagination.limit, data: departments,
  });
});

const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('headOfDepartment');
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  const [studentCount, teacherCount, courseCount] = await Promise.all([
    Student.countDocuments({ department: department._id }),
    Teacher.countDocuments({ department: department._id }),
    Course.countDocuments({ department: department._id }),
  ]);

  res.status(200).json({ success: true, data: { ...department.toObject(), studentCount, teacherCount, courseCount } });
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.status(200).json({ success: true, data: department });
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const inUse = await Course.countDocuments({ department: req.params.id });
  if (inUse > 0) {
    res.status(400);
    throw new Error('Cannot delete a department that still has courses assigned to it');
  }
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }
  res.status(200).json({ success: true, message: 'Department deleted successfully' });
});

module.exports = { createDepartment, getDepartments, getDepartment, updateDepartment, deleteDepartment };
