const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const httpStatus = require("http-status");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const { sendEmail } = require("../utils/email");

// Register user
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Generate JWT token
    const token = user.generateAuthToken();

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Email Verification",
        template: "emailVerification",
        data: {
          name: user.name,
          verificationToken,
          frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
        },
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    res.status(httpStatus.CREATED).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
        },
        token,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (user.status !== "active") {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Account is not active",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = await generateRefreshToken(user._id, req.ip);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          avatar: user.avatar,
        },
        token,
        refreshToken: refreshToken.token,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.findOneAndUpdate(
        { token: refreshToken },
        { revokedAt: new Date(), revokedByIp: req.ip }
      );
    }

    res.status(httpStatus.OK).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc || !tokenDoc.isActive) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user || user.status !== "active") {
      return res.status(httpStatus.UNAUTHORIZED).json({
        success: false,
        message: "User not found or inactive",
      });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = await generateRefreshToken(user._id, req.ip);

    // Revoke old refresh token
    tokenDoc.revokedAt = new Date();
    tokenDoc.revokedByIp = req.ip;
    tokenDoc.replacedByToken = newRefreshToken.token;
    await tokenDoc.save();

    res.status(httpStatus.OK).json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        token: newToken,
        refreshToken: newRefreshToken.token,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Token refresh failed",
      error: error.message,
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(httpStatus.OK).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          status: user.status,
          profile: user.profile,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
        },
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get user profile",
      error: error.message,
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send reset email
    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        template: "passwordReset",
        data: {
          name: user.name,
          resetToken,
          frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
        },
      });

      res.status(httpStatus.OK).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpire = undefined;
      await user.save();

      res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to send password reset email",
      });
    }
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Password reset request failed",
      error: error.message,
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token and find user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    // Generate new token
    const authToken = user.generateAuthToken();

    res.status(httpStatus.OK).json({
      success: true,
      message: "Password reset successful",
      data: {
        token: authToken,
      },
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Password reset failed",
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(httpStatus.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Password change failed",
      error: error.message,
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token and find user
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Verify email
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(httpStatus.OK).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

// Helper function to generate refresh token
const generateRefreshToken = async (userId, ipAddress) => {
  const token = uuidv4();
  const expiresAt = moment().add(7, "days").toDate();

  const refreshToken = await RefreshToken.create({
    userId,
    token,
    expiresAt,
    createdByIp: ipAddress,
  });

  return refreshToken;
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
};
