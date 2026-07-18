const express = require('express');
const multer = require('multer');
const UploadController = require('../controllers/UploadController');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) return callback(null, true);
    return callback(new Error('Only PDF files are accepted'));
  }
});

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(null, true);
    return callback(new Error('Only JPG, PNG, and WebP images are accepted'));
  }
});

router.post('/papers/:paperId/file', AuthMiddleware.verifyToken, upload.single('file'), UploadController.uploadPaperFile);
router.post('/papers/:paperId/cover', AuthMiddleware.verifyToken, imageUpload.single('file'), UploadController.uploadPaperCover);
router.get('/user-files/:fileId', UploadController.downloadUserFile);
router.get('/:fileId', AuthMiddleware.optionalToken, UploadController.downloadPaperFile);

module.exports = router;
