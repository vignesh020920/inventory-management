// controllers/adminAccountController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const httpStatus = require("http-status");
const path = require("path");
const fs = require("fs").promises;

// @desc    Get current admin profile
// @route   GET /api/admin/account/profile
// @access  Private/Admin
const getCurrentProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/account/profile
// @access  Private/Admin
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validation
    if (!name || !email) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Name and email are required",
      });
    }

    // Additional validation
    if (name.trim().length === 0 || name.length > 50) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Name must be between 1 and 50 characters",
      });
    }

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Check if email is already taken by another user
    if (email.toLowerCase() !== req.user.email.toLowerCase()) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "Email is already in use",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.toLowerCase().trim(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: errors[0] || "Validation error",
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Email is already in use",
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// @desc    Change admin password
// @route   PUT /api/admin/account/password
// @access  Private/Admin
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Get user with password
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      // Clear refresh token to force re-login (optional)
      refreshToken: undefined,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
};

// @desc    Upload admin avatar
// @route   POST /api/admin/account/avatar
// @access  Private/Admin
const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Please provide an image file",
      });
    }

    // Get current user to check for existing avatar
    const user = await User.findById(userId);
    if (!user) {
      // Delete uploaded file if user not found
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const oldAvatarPath = path.join(
        __dirname,
        "../uploads/avatars",
        path.basename(user.avatar)
      );
      await fs.unlink(oldAvatarPath).catch((err) => {
        console.error("Error deleting old avatar:", err);
      });
    }

    // Create avatar URL - using your multer configuration
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Update user with new avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.status(httpStatus.OK).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: { avatar: avatarUrl },
    });
  } catch (error) {
    console.error("Upload avatar error:", error);

    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to upload avatar",
      error: error.message,
    });
  }
};

// @desc    Remove admin avatar
// @route   DELETE /api/admin/account/avatar
// @access  Private/Admin
const removeAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.avatar) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "No avatar to remove",
      });
    }

    // Delete avatar file - extract filename from URL
    const filename = path.basename(user.avatar);
    const avatarPath = path.join(__dirname, "../uploads/avatars", filename);
    await fs.unlink(avatarPath).catch((err) => {
      console.error("Error deleting avatar file:", err);
    });

    // Update user to remove avatar
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $unset: { avatar: 1 } },
      { new: true }
    ).select("-password");

    res.status(httpStatus.OK).json({
      success: true,
      message: "Avatar removed successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to remove avatar",
      error: error.message,
    });
  }
};

// @desc    Get admin account statistics (optional)
// @route   GET /api/admin/account/stats
// @access  Private/Admin
const getAccountStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with additional stats
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate account age
    const accountAge = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get login frequency (if you track login history)
    const lastLoginDays = user.lastLogin
      ? Math.floor(
          (Date.now() - new Date(user.lastLogin).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    const stats = {
      accountAge,
      lastLoginDays,
      isEmailVerified: user.isEmailVerified,
      hasAvatar: !!user.avatar,
      profileCompleteness: calculateProfileCompleteness(user),
      securityScore: calculateSecurityScore(user),
    };

    res.status(httpStatus.OK).json({
      success: true,
      message: "Account statistics retrieved successfully",
      data: { stats },
    });
  } catch (error) {
    console.error("Get account stats error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get account statistics",
      error: error.message,
    });
  }
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  let completeness = 0;
  const fields = [
    user.name,
    user.email,
    user.avatar,
    user.isEmailVerified,
    user.profile?.bio,
    user.profile?.phone,
  ];

  fields.forEach((field) => {
    if (field) completeness += 1;
  });

  return Math.round((completeness / fields.length) * 100);
};

// Helper function to calculate security score
const calculateSecurityScore = (user) => {
  let score = 0;

  // Email verified
  if (user.isEmailVerified) score += 25;

  // Account active
  if (user.status === "active") score += 25;

  // Recent login activity
  if (
    user.lastLogin &&
    Date.now() - new Date(user.lastLogin).getTime() < 30 * 24 * 60 * 60 * 1000
  ) {
    score += 25;
  }

  // Has profile information
  if (user.profile?.bio || user.profile?.phone) score += 25;

  return score;
};

// @desc    Update admin preferences (optional)
// @route   PUT /api/admin/account/preferences
// @access  Private/Admin
const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    const userId = req.user.id;

    // Validate preferences structure
    if (!preferences || typeof preferences !== "object") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Valid preferences object is required",
      });
    }

    // Update user preferences (you might need to add this field to your schema)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Preferences updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update preferences",
      error: error.message,
    });
  }
};

module.exports = {
  getCurrentProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
  getAccountStats,
  updatePreferences,
};
