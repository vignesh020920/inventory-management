// middleware/upload.js - Complete fresh version
const multer = require("multer");

console.log("🚀 LOADING CLOUDINARY-READY MIDDLEWARE WITH MEMORY STORAGE");

// Use memory storage for Cloudinary
const memoryStorage = multer.memoryStorage();

// File filters
const productImageFilter = (req, file, cb) => {
  console.log(`🔍 Filtering product image: ${file.originalname}`);
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for product images"), false);
  }
};

const avatarFilter = (req, file, cb) => {
  console.log(`🔍 Filtering avatar: ${file.originalname}`);
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for avatars"), false);
  }
};

// Configure multer with memory storage
const productUpload = multer({
  storage: memoryStorage,
  fileFilter: productImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10,
  },
});

const avatarUpload = multer({
  storage: memoryStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

console.log("✅ Memory storage middleware configured successfully");

module.exports = {
  productUpload,
  avatarUpload,
};
