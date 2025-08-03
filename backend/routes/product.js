const express = require("express");
const router = express.Router();

// Import controllers
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductStats,
} = require("../controllers/productController");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validation");
const { productUpload } = require("../middleware/upload"); // Only import productUpload

// Import validation schemas
const {
  createProductSchema,
  updateProductSchema,
} = require("../validations/product");

const validateProductWithFiles = (schema) => {
  return (req, res, next) => {
    console.log("=== VALIDATION MIDDLEWARE DEBUG ===");
    console.log("Before validation - req.files:", req.files?.length || 0);
    console.log("Before validation - req.body:", req.body);

    // Parse JSON fields from form data
    if (req.body.tags && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch (e) {
        req.body.tags = [];
      }
    }

    // Fix: Handle existingImages properly
    if (req.body.existingImages) {
      // If it's a single string (not an array), make it an array
      if (typeof req.body.existingImages === "string") {
        req.body.existingImages = [req.body.existingImages];
      }

      // Ensure it's always an array for validation
      if (!Array.isArray(req.body.existingImages)) {
        req.body.existingImages = [req.body.existingImages];
      }
    } else {
      req.body.existingImages = [];
    }

    // Handle imageAlts - ensure it's an array
    if (req.body.imageAlts) {
      if (!Array.isArray(req.body.imageAlts)) {
        req.body.imageAlts = [req.body.imageAlts];
      }
    } else {
      req.body.imageAlts = [];
    }

    // Convert string numbers to actual numbers
    const numericFields = [
      "price",
      "regularPrice",
      "weightKg",
      "stockQuantity",
      "heightInches",
      "lengthInches",
      "depthInches",
    ];
    numericFields.forEach((field) => {
      if (req.body[field] && typeof req.body[field] === "string") {
        const num = parseFloat(req.body[field]);
        if (!isNaN(num)) {
          req.body[field] = num;
        }
      }
    });

    // Validate using Joi
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      console.log("Validation error:", error.details);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
    }

    req.body = value;

    // Parse existingImages JSON strings after validation
    if (req.body.existingImages && req.body.existingImages.length > 0) {
      const parsedExistingImages = [];
      req.body.existingImages.forEach((imgData) => {
        try {
          if (typeof imgData === "string") {
            parsedExistingImages.push(JSON.parse(imgData));
          } else {
            parsedExistingImages.push(imgData);
          }
        } catch (e) {
          console.warn("Invalid existing image data:", imgData);
        }
      });
      req.body.existingImages = parsedExistingImages;
    }

    console.log("After validation - req.files:", req.files?.length || 0);
    console.log("After validation - req.body:", req.body);
    console.log("=== END VALIDATION DEBUG ===");

    next();
  };
};

// Public routes
router.get("/search", searchProducts);

// Protected routes
router.get("/", protect, getAllProducts);
router.get("/stats", protect, getProductStats);
router.get("/:id", protect, getProductById);

// Admin only routes with file upload
router.post(
  "/",
  protect,
  productUpload.array("images", 10), // Use productUpload for multiple images
  validateProductWithFiles(createProductSchema),
  createProduct
);

router.put(
  "/:id",
  protect,
  productUpload.array("images", 10), // Use productUpload for multiple images
  validateProductWithFiles(updateProductSchema),
  updateProduct
);

router.delete("/:id", protect, deleteProduct);

module.exports = router;
