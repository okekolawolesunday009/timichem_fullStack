const express = require("express")
const { check } = require("express-validator")
const { register, login, getMe, updateProfile } = require("../controllers/auth")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Register user
router.post(
  "/register",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
  ],
  register,
)

// Login user
router.post(
  "/login",
  [check("email", "Please include a valid email").isEmail(), check("password", "Password is required").exists()],
  login,
)

// Get current user
router.get("/me", protect, getMe)

// Update profile
router.put(
  "/update-profile",
  [
    protect,
    check("name", "Name is required").optional(),
    check("email", "Please include a valid email").optional().isEmail(),
  ],
  updateProfile,
)

module.exports = router

