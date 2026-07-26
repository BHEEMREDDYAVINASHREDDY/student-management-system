const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${req.user ? req.user._id : 'anon'}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowedTypes.test(file.mimetype);

  if (extValid && mimeValid) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.maxFileUploadMb * 1024 * 1024 },
});

// Separate in-memory uploader for CSV imports (small files, parsed immediately, never persisted to disk)
const csvUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const isCsv = file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv';
    if (isCsv) return cb(null, true);
    cb(new Error('Only .csv files are allowed'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { upload, csvUpload };
