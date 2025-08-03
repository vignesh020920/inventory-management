const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const httpStatus = require('http-status');
const User = require('../models/User');

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user avatar
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar: avatarPath
      }
    });
  } catch (error) {
    // Delete uploaded file if error occurs
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'uploads', 'avatars', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Avatar upload failed',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      path: `/uploads/files/${file.filename}`,
      mimetype: file.mimetype
    }));

    res.status(httpStatus.OK).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        files: uploadedFiles
      }
    });
  } catch (error) {
    // Delete uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(__dirname, '..', 'uploads', 'files', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const { folder } = req.query; // 'avatars' or 'files'

    if (!folder || !['avatars', 'files'].includes(folder)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Invalid folder specified'
      });
    }

    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'File not found'
      });
    }

    // If deleting avatar, update user record
    if (folder === 'avatars') {
      const user = await User.findById(req.user.id);
      if (user.avatar === `/uploads/avatars/${filename}`) {
        user.avatar = null;
        await user.save();
      }
    }

    fs.unlinkSync(filePath);

    res.status(httpStatus.OK).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadAvatar,
  uploadFiles,
  deleteFile
};