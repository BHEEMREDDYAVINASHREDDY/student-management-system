const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    examType: {
      type: String,
      enum: ['quiz', 'assignment', 'midterm', 'final', 'practical'],
      required: true,
    },
    marksObtained: { type: Number, required: true, min: 0 },
    maxMarks: { type: Number, required: true, min: 1 },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Derived grade + percentage, computed on the fly (kept out of persisted state to avoid drift)
marksSchema.virtual('percentage').get(function getPercentage() {
  return this.maxMarks ? Number(((this.marksObtained / this.maxMarks) * 100).toFixed(2)) : 0;
});

marksSchema.set('toJSON', { virtuals: true });
marksSchema.set('toObject', { virtuals: true });

marksSchema.index({ student: 1, subject: 1, examType: 1 }, { unique: true });

module.exports = mongoose.model('Marks', marksSchema);
