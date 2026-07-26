const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: {
      type: String,
      enum: ['Assistant Professor', 'Associate Professor', 'Professor', 'Lecturer', 'HOD'],
      default: 'Assistant Professor',
    },
    qualification: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    dateOfJoining: { type: Date, default: Date.now },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
