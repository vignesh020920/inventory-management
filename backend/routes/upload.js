const express = require('express');
const router = express.Router();

// Import controllers
const {
  uploadAvatar,
  uploadFiles,
  deleteFile
} = require('../controllers/uploadController');

// Import middleware
const { protect } = require('../middleware/auth');
const { avatarUpload, fileUpload } = require('../middleware/upload');

// Upload routes
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);
router.post('/files', protect, fileUpload.array('files', 10), uploadFiles);
router.delete('/file/:filename', protect, deleteFile);

module.exports = router;