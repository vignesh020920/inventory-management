const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { createServer } = require("http");
const { Server } = require("socket.io");
const path = require("path");
const loadEnv = require("./utils/envConfig");
loadEnv();

// Import and configure Cloudinary
const { configureCloudinary } = require("./config/cloudinary");

//import centralized routes
const apiRoutes = require("./routes");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { connectDB } = require("./config/database");
// const { setupSocket } = require("./config/socket");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Connect to database
connectDB();

// Initialize Cloudinary BEFORE using any routes
configureCloudinary();

// CORS - Move this before helmet for better compatibility
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

// Security middleware - Updated helmet configuration for Cloudinary images
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Allow cross-origin embedding
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resources
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com", // Allow Cloudinary images
          "https://cloudinary.com",
          process.env.CORS_ORIGIN || "http://localhost:5173",
          process.env.BACKEND_URL || "http://localhost:5000", // Your backend URL
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs:
    parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Static files middleware (Keep for backward compatibility or any remaining local files)
// Note: With Cloudinary, you might not need this anymore, but keeping for transition period
app.use(
  "/uploads",
  (req, res, next) => {
    // CORS headers
    const allowedOrigins = (
      process.env.CORS_ORIGINS || "http://localhost:5173"
    ).split(",");
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || !origin) {
      res.header("Access-Control-Allow-Origin", origin || "*");
    }

    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Security headers
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");
    res.header("X-XSS-Protection", "1; mode=block");

    // Cache control
    res.header("Cache-Control", "public, max-age=31536000, immutable");

    // Only allow specific file extensions for security
    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".txt",
      ".csv",
    ];
    const fileExtension = path.extname(req.path).toLowerCase();

    if (req.path !== "/" && !allowedExtensions.includes(fileExtension)) {
      return res.status(403).json({
        success: false,
        message: "File type not allowed",
      });
    }

    next();
  },
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1y",
    etag: true,
    lastModified: true,
    index: false,
    dotfiles: "deny", // Deny access to dotfiles
  })
);

// Setup Socket.io
// setupSocket(io);

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Use centralized routes
app.use("/api", apiRoutes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`📁 Cloudinary integration active`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server, io };
