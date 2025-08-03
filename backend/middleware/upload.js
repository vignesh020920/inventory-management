const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Create upload directories if they don't exist
const createUploadDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Product images storage configuration (NEW)
// Make sure this path is correct and writable
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "products");
    console.log("Upload directory:", uploadDir); // Debug line
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `product-${uuidv4()}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    console.log("Generated filename:", uniqueName); // Debug line
    cb(null, uniqueName);
  },
});

// Avatar storage configuration (EXISTING)
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "avatars");
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// File storage configuration (EXISTING)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads", "files");
    createUploadDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter for product images (NEW)
const productImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for product images"), false);
  }
};

// File filter for avatars (images only) (EXISTING)
const avatarFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for avatars"), false);
  }
};

// File filter for general files (EXISTING)
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    "image/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/csv",
  ];

  const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));

  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

// Product images upload middleware (NEW)
const productUpload = multer({
  storage: productStorage,
  fileFilter: productImageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10, // Maximum 10 files
  },
});

// Avatar upload middleware (EXISTING)
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// File upload middleware (EXISTING)
const fileUpload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

module.exports = {
  productUpload, // NEW - only for products
  avatarUpload, // EXISTING
  fileUpload, // EXISTING
};
