const User = require("../models/User");
const httpStatus = require("http-status");
const moment = require("moment");
const bcrypt = require("bcryptjs");

// Create user (Admin only)
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "user",
      status = "active",
      isEmailVerified = false,
      profile,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      status,
      isEmailVerified,
    };

    // Add profile if provided
    if (profile) {
      userData.profile = profile;
    }

    // Create user
    const user = await User.create(userData);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    // Log user creation
    console.log(
      `New user created: ${user.email} (${user.role}) by admin ${req.user.email}`
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "User created successfully",
      data: {
        user: userResponse,
        createdBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Create user error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Handle duplicate key error (MongoDB)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Bulk create users (Admin only)
const bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Users array is required and cannot be empty",
      });
    }

    if (users.length > 50) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Cannot create more than 50 users at once",
      });
    }

    const results = {
      successful: [],
      failed: [],
    };

    const saltRounds = 12;

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];

      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          results.failed.push({
            index: i,
            email: userData.email,
            error: "User with this email already exists",
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
          userData.password || "DefaultPassword123!",
          saltRounds
        );

        // Create user data
        const newUserData = {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role || "user",
          status: userData.status || "active",
          isEmailVerified: userData.isEmailVerified || false,
          profile: userData.profile || {},
        };

        // Create user
        const user = await User.create(newUserData);
        const userResponse = user.toObject();
        delete userResponse.password;

        results.successful.push({
          index: i,
          user: userResponse,
        });
      } catch (error) {
        results.failed.push({
          index: i,
          email: userData.email,
          error: error.message,
        });
      }
    }

    // Log bulk creation
    console.log(
      `Bulk user creation: ${results.successful.length} successful, ${results.failed.length} failed by admin ${req.user.email}`
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      message: `Bulk user creation completed. ${results.successful.length} successful, ${results.failed.length} failed.`,
      data: {
        results,
        summary: {
          total: users.length,
          successful: results.successful.length,
          failed: results.failed.length,
        },
        createdBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Bulk create users error:", error);

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to bulk create users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Bulk delete users (Admin only)
const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "User IDs array is required and cannot be empty",
      });
    }

    if (userIds.length > 100) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Cannot delete more than 100 users at once",
      });
    }

    // Check if admin is trying to delete their own account
    if (userIds.includes(req.user.id)) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Get users before deletion for logging
    const usersToDelete = await User.find({
      _id: { $in: userIds },
    }).select("name email role");

    // Prevent deletion of other admin accounts
    const adminUsers = usersToDelete.filter((user) => user.role === "admin");
    if (adminUsers.length > 0) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: "Cannot delete admin accounts",
        adminUsers: adminUsers.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
        })),
      });
    }

    // Delete users
    const deleteResult = await User.deleteMany({
      _id: { $in: userIds },
    });

    // Log bulk deletion
    console.log(
      `Bulk user deletion: ${deleteResult.deletedCount} users deleted by admin ${req.user.email}`
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: `${deleteResult.deletedCount} users deleted successfully`,
      data: {
        deletedCount: deleteResult.deletedCount,
        requestedCount: userIds.length,
        deletedUsers: usersToDelete.map((user) => ({
          id: user._id,
          name: user.name,
          email: user.email,
        })),
        deletedBy: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
        },
        timestamp: new Date(),
      },
    });
  } catch (error) {
    console.error("Bulk delete users error:", error);

    // Handle cast errors (invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid user ID format in the provided list",
      });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to bulk delete users",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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
  createUser,
  bulkCreateUsers,
  bulkDeleteUsers,
};
