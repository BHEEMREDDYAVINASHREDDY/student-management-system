const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Semester 1"
    number: { type: Number, required: true, min: 1, max: 12 },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

semesterSchema.index({ course: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Semester', semesterSchema);
