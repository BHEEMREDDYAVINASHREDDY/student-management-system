const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const ApiFeatures = require('../utils/apiFeatures');
const { toCsv, parseCsv } = require('../utils/csvHelper');

const POPULATE = 'user course department currentSemester';

// @desc    Create a student (creates linked User account + Student profile)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = asyncHandler(async (req, res) => {
  const {
    name, email, password, rollNumber, course, department, currentSemester,
    dateOfBirth, gender, phone, address, guardianName, guardianPhone, batchYear,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const existingRoll = await Student.findOne({ rollNumber });
  if (existingRoll) {
    res.status(400);
    throw new Error('A student with this roll number already exists');
  }

  const user = await User.create({ name, email, password: password || 'Student@123', role: 'student' });

  const student = await Student.create({
    user: user._id,
    rollNumber,
    course,
    department,
    currentSemester,
    dateOfBirth,
    gender,
    phone,
    address,
    guardianName,
    guardianPhone,
    batchYear,
  });

  const populated = await student.populate(POPULATE);
  res.status(201).json({ success: true, data: populated });
});

// @desc    List students with search, filter, sort, pagination
// @route   GET /api/students
// @access  Private/Admin,Teacher
const getStudents = asyncHandler(async (req, res) => {
  const total = await Student.countDocuments();

  let query = Student.find().populate(POPULATE);
  const features = new ApiFeatures(query, req.query).filter().sort().paginate();
  let students = await features.query;

  // rollNumber search requires post-populate filtering by name/email since those live on User
  if (req.query.search) {
    const regex = new RegExp(req.query.search, 'i');
    students = students.filter(
      (s) => regex.test(s.rollNumber) || regex.test(s.user?.name || '') || regex.test(s.user?.email || '')
    );
  }

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page: features.pagination.page,
    limit: features.pagination.limit,
    data: students,
  });
});

// @desc    Get a single student by id
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate(POPULATE);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }
  res.status(200).json({ success: true, data: student });
});

// @desc    Update a student profile (and optionally linked user name/email)
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const editableFields = [
    'course', 'department', 'currentSemester', 'dateOfBirth', 'gender', 'phone',
    'address', 'guardianName', 'guardianPhone', 'batchYear', 'status',
  ];
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) student[field] = req.body[field];
  });
  await student.save();

  if (req.body.name || req.body.email) {
    await User.findByIdAndUpdate(student.user, {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.email && { email: req.body.email }),
    });
  }

  const populated = await student.populate(POPULATE);
  res.status(200).json({ success: true, data: populated });
});

// @desc    Delete a student and their linked user account
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  await User.findByIdAndDelete(student.user);
  await Marks.deleteMany({ student: student._id });
  await Attendance.deleteMany({ student: student._id });
  await student.deleteOne();

  res.status(200).json({ success: true, message: 'Student deleted successfully' });
});

// @desc    Upload / replace a student's profile photo
// @route   PUT /api/students/:id/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No image file uploaded');
  }
  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  const avatarPath = `/uploads/profiles/${req.file.filename}`;
  await User.findByIdAndUpdate(student.user, { avatar: avatarPath });

  res.status(200).json({ success: true, avatar: avatarPath });
});

// @desc    Export all students as CSV
// @route   GET /api/students/export/csv
// @access  Private/Admin
const exportStudentsCsv = asyncHandler(async (req, res) => {
  const students = await Student.find().populate(POPULATE);

  const csv = toCsv(students, [
    { label: 'Roll Number', value: (s) => s.rollNumber },
    { label: 'Name', value: (s) => s.user?.name },
    { label: 'Email', value: (s) => s.user?.email },
    { label: 'Course', value: (s) => s.course?.name },
    { label: 'Department', value: (s) => s.department?.name },
    { label: 'Semester', value: (s) => s.currentSemester?.name },
    { label: 'Batch Year', value: (s) => s.batchYear },
    { label: 'Status', value: (s) => s.status },
    { label: 'Phone', value: (s) => s.phone },
  ]);

  res.header('Content-Type', 'text/csv');
  res.attachment('students.csv');
  res.status(200).send(csv);
});

// @desc    Bulk-import students from an uploaded CSV
//          Expected columns: Name,Email,RollNumber,Course,Department,Semester,BatchYear
// @route   POST /api/students/import/csv
// @access  Private/Admin
const importStudentsCsv = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No CSV file uploaded');
  }

  const text = req.file.buffer.toString('utf-8');
  const rows = parseCsv(text);

  const results = { created: 0, skipped: 0, errors: [] };

  for (const row of rows) {
    try {
      const email = row.Email || row.email;
      const exists = await User.findOne({ email });
      if (exists) {
        results.skipped += 1;
        continue;
      }
      const user = await User.create({
        name: row.Name || row.name,
        email,
        password: 'Student@123',
        role: 'student',
      });
      await Student.create({
        user: user._id,
        rollNumber: row.RollNumber || row.rollNumber,
        course: row.Course || row.course,
        department: row.Department || row.department,
        currentSemester: row.Semester || row.semester,
        batchYear: Number(row.BatchYear || row.batchYear) || new Date().getFullYear(),
      });
      results.created += 1;
    } catch (err) {
      results.errors.push({ row, message: err.message });
    }
  }

  res.status(200).json({ success: true, results });
});

module.exports = {
  createStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  uploadAvatar,
  exportStudentsCsv,
  importStudentsCsv,
};
