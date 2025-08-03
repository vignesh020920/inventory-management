const User = require("../models/User");
const httpStatus = require("http-status");
const moment = require("moment");

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    if (status) {
      query.status = status;
    }

    // Execute query
    const users = await User.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password");

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get user",
      error: error.message,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "profile"];
    const updates = {};

    // Only allow specific fields to be updated
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(httpStatus.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name",
      "email",
      "role",
      "status",
      "isEmailVerified",
    ];
    const updates = {};

    // Only allow specific fields to be updated
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow admin to delete themselves
    if (id === req.user.id) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};

// Get user statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const inactiveUsers = await User.countDocuments({ status: "inactive" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Users registered in the last 30 days
    const thirtyDaysAgo = moment().subtract(30, "days").toDate();
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Users logged in the last 7 days
    const sevenDaysAgo = moment().subtract(7, "days").toDate();
    const activeThisWeek = await User.countDocuments({
      lastLogin: { $gte: sevenDaysAgo },
    });

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        verifiedUsers,
        adminUsers,
        newUsers,
        activeThisWeek,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get user statistics",
      error: error.message,
    });
  }
};

// controllers/userController.js - Simplified without reason field
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = req?.user;

    // Validate user ID
    if (!id) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent admin from changing their own status
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "You cannot change your own account status",
      });
    }

    // Check if status is actually changing
    if (user.status === status) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: `User status is already ${status}`,
      });
    }

    // Store previous status for logging
    const previousStatus = user.status;

    // Update user status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    // Log the status change
    console.log(
      `User status changed: ${user.email} from ${previousStatus} to ${status} by ${req.user.email}`
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: {
        user: updatedUser,
        statusChange: {
          from: previousStatus,
          to: status,
          changedBy: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
          },
          timestamp: new Date(),
        },
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: errors[0] || "Validation error",
      });
    }

    // Handle cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to update user status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
};
