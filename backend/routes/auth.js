const express = require("express");
const router = express.Router();

// Import controllers
const {
  // register,
  login,
  logout,
  refreshToken,
  getMe,
  // forgotPassword,
  // resetPassword,
  changePassword,
  // verifyEmail
} = require("../controllers/authController");

// Import middleware
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validation");

// Import validation schemas
const {
  // registerSchema,
  loginSchema,
  // forgotPasswordSchema,
  // resetPasswordSchema,
  changePasswordSchema,
} = require("../validations/auth");

// Public routes
// router.post('/register', validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
// router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
// router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
// router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get("/me", protect, getMe);
router.post(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);

module.exports = router;
