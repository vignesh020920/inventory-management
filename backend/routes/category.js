// routes/category.js
const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryOptions,
  getCategoryStats,
} = require("../controllers/categoryController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

// Import validation schemas
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validations/category");

// Public routes
router.get("/options", getCategoryOptions);

// Protected routes
router.get(
  "/",
  // protect,
  getAllCategories
);
router.get("/stats", protect, authorize("admin"), getCategoryStats);
router.get("/:id", protect, getCategoryById);

// Admin only routes
router.post(
  "/",
  // protect,
  // authorize("admin"),
  validate(createCategorySchema),
  createCategory
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateCategorySchema),
  updateCategory
);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
