const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Subject = require('../models/Subject');
const ApiFeatures = require('../utils/apiFeatures');
const { toCsv } = require('../utils/csvHelper');

const POPULATE = 'user department subjects';

const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, employeeId, department, designation, qualification, phone, address, gender } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }
  const existingEmp = await Teacher.findOne({ employeeId });
  if (existingEmp) {
    res.status(400);
    throw new Error('A teacher with this employee ID already exists');
  }

  const user = await User.create({ name, email, password: password || 'Teacher@123', role: 'teacher' });

  const teacher = await Teacher.create({
    user: user._id, employeeId, department, designation, qualification, phone, address, gender,
  });

  const populated = await teacher.populate(POPULATE);
  res.status(201).json({ success: true, data: populated });
});

const getTeachers = asyncHandler(async (req, res) => {
  const total = await Teacher.countDocuments();
  let query = Teacher.find().populate(POPULATE);
  const features = new ApiFeatures(query, req.query).filter().sort().paginate();
  let teachers = await features.query;

  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    teachers = teachers.filter(
      (t) => regex.test(t.employeeId) || regex.test(t.user?.name || '') || regex.test(t.user?.email || '')
    );
  }

  res.status(200).json({
    success: true, count: teachers.length, total,
    page: features.pagination.page, limit: features.pagination.limit, data: teachers,
  });
});

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id).populate(POPULATE);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  res.status(200).json({ success: true, data: teacher });
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  const editable = ['department', 'designation', 'qualification', 'phone', 'address', 'gender', 'isActive'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) teacher[field] = req.body[field];
  });
  await teacher.save();

  if (req.body.name || req.body.email) {
    await User.findByIdAndUpdate(teacher.user, {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
    });
  }

  const populated = await teacher.populate(POPULATE);
  res.status(200).json({ success: true, data: populated });
});

const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  await Subject.updateMany({ teacher: teacher._id }, { $set: { teacher: null } });
  await User.findByIdAndDelete(teacher.user);
  await teacher.deleteOne();

  res.status(200).json({ success: true, message: 'Teacher deleted successfully' });
});

const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }
  const avatarPath = `/uploads/profiles/${req.file.filename}`;
  await User.findByIdAndUpdate(teacher.user, { avatar: avatarPath });
  res.status(200).json({ success: true, avatar: avatarPath });
});

const exportTeachersCsv = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().populate(POPULATE);
  const csv = toCsv(teachers, [
    { label: 'Employee ID', value: (t) => t.employeeId },
    { label: 'Name', value: (t) => t.user?.name },
    { label: 'Email', value: (t) => t.user?.email },
    { label: 'Department', value: (t) => t.department?.name },
    { label: 'Designation', value: (t) => t.designation },
    { label: 'Phone', value: (t) => t.phone },
  ]);
  res.header('Content-Type', 'text/csv');
  res.attachment('teachers.csv');
  res.status(200).send(csv);
});

module.exports = {
  createTeacher, getTeachers, getTeacher, updateTeacher, deleteTeacher, uploadAvatar, exportTeachersCsv,
};
