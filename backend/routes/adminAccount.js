// routes/adminAccount.js - With debugging
const express = require("express");
const router = express.Router();

// Import middleware with error checking
const authMiddleware = require("../middleware/auth");
const { protect, adminOnly } = authMiddleware;
const { avatarUpload } = require("../middleware/upload");

// Import controllers
const {
  getCurrentProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  removeAvatar,
} = require("../controllers/adminAccountController");

//   // Apply middleware
router.use(protect);
router.use(adminOnly);

// Define routes
router.get("/profile", getCurrentProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.post("/avatar", avatarUpload.single("avatar"), uploadAvatar);
router.delete("/avatar", removeAvatar);

module.exports = router;
