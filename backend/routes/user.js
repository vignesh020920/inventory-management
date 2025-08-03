const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
} = require("../controllers/userController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

// Import validation schemas
const {
  updateProfileSchema,
  adminUpdateUserSchema,
  updateUserStatusSchema,
} = require("../validations/user");

// User routes
router.get("/profile", protect, (req, res) => {
  res.redirect("/api/auth/me");
});

router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

// Admin routes
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/stats", protect, authorize("admin"), getUserStats);
router.get("/:id", protect, authorize("admin"), getUserById);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(adminUpdateUserSchema),
  updateUser
);
router.delete("/:id", protect, authorize("admin"), deleteUser);
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  validate(updateUserStatusSchema),
  updateUserStatus
);

module.exports = router;
