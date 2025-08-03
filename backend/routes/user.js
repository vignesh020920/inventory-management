const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllUsers,
  getUserById,
  createUser, // Add this
  updateProfile,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
  bulkCreateUsers, // Add this
  bulkDeleteUsers, // Add this
} = require("../controllers/userController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

// Import validation schemas
const {
  updateProfileSchema,
  adminUpdateUserSchema,
  updateUserStatusSchema,
  createUserSchema, // Add this
  bulkCreateUsersSchema, // Add this
  bulkDeleteUsersSchema, // Add this
} = require("../validations/user");

// User routes
router.get("/profile", protect, (req, res) => {
  res.redirect("/api/auth/me");
});

router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

// Admin routes
router.get("/", protect, authorize("admin"), getAllUsers);
router.get("/stats", protect, authorize("admin"), getUserStats);

// User creation routes (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createUserSchema),
  createUser
);
router.post(
  "/bulk",
  protect,
  authorize("admin"),
  validate(bulkCreateUsersSchema),
  bulkCreateUsers
);

// Bulk operations (Admin only)
router.delete(
  "/bulk",
  protect,
  authorize("admin"),
  validate(bulkDeleteUsersSchema),
  bulkDeleteUsers
);

// Individual user routes (Admin only)
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
