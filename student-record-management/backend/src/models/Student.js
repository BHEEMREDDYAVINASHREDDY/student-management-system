const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    currentSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    guardianName: { type: String, default: '' },
    guardianPhone: { type: String, default: '' },
    admissionDate: { type: Date, default: Date.now },
    batchYear: { type: Number, required: true },
    status: { type: String, enum: ['active', 'graduated', 'suspended', 'dropped'], default: 'active' },
  },
  { timestamps: true }
);

studentSchema.index({ course: 1, department: 1, currentSemester: 1 });

module.exports = mongoose.model('Student', studentSchema);
