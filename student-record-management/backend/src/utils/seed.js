/* eslint-disable no-console */
// One-off script: creates a default admin account and a demo department/course so the app
// is usable immediately after a fresh clone. Run with: npm run seed
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Semester = require('../models/Semester');

const run = async () => {
  await mongoose.connect(config.mongoUri);

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (!existingAdmin) {
    await User.create({
      name: 'System Admin',
      email: 'admin@srms.local',
      password: 'Admin@123',
      role: 'admin',
    });
    console.log('Created default admin -> admin@srms.local / Admin@123');
  } else {
    console.log('Admin already exists, skipping');
  }

  let dept = await Department.findOne({ code: 'CSE' });
  if (!dept) {
    dept = await Department.create({
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science and Engineering',
    });
    console.log('Created demo department CSE');
  }

  let course = await Course.findOne({ code: 'BTECH-CSE' });
  if (!course) {
    course = await Course.create({
      name: 'B.Tech Computer Science',
      code: 'BTECH-CSE',
      department: dept._id,
      durationYears: 4,
      totalSemesters: 8,
    });
    console.log('Created demo course B.Tech CSE');
  }

  const semCount = await Semester.countDocuments({ course: course._id });
  if (semCount === 0) {
    const semesters = Array.from({ length: course.totalSemesters }, (_, i) => ({
      name: `Semester ${i + 1}`,
      number: i + 1,
      course: course._id,
    }));
    await Semester.insertMany(semesters);
    console.log(`Created ${semesters.length} semesters for B.Tech CSE`);
  }

  console.log('Seed complete');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
