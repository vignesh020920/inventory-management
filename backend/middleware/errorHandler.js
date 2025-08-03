const httpStatus = require("http-status");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = {
      message,
      statusCode: httpStatus.NOT_FOUND,
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = {
      message,
      statusCode: httpStatus.BAD_REQUEST,
    };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = {
      message,
      statusCode: httpStatus.BAD_REQUEST,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = {
      message,
      statusCode: httpStatus.UNAUTHORIZED,
    };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = {
      message,
      statusCode: httpStatus.UNAUTHORIZED,
    };
  }

  res.status(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

// middleware/errorHandler.js
const multer = require("multer");

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "File too large",
      });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Unexpected field",
      });
    }
  }

  if (err.message.includes("Only image files are allowed")) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "Only image files are allowed for avatars",
    });
  }

  if (err.message.includes("File type not allowed")) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "File type not allowed",
    });
  }

  next(err);
};

module.exports = { errorHandler, handleMulterError };
