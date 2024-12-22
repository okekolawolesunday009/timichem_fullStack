const express = require("express");
const { check } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/auth");
const { protect, admin, manager, accountant } = require("../middleware/auth");

const router = express.Router();


// Login user
router.post(
  "/login",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);


// Register user
router.post(
  "/register",
  [
    check("lastName", "Name is required").not().isEmpty(),
    check("firstName", "Name is required").not().isEmpty(),
    
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  register
);


// Get current user
// router.get("/me", protect, getMe)

router.post(
  "/change-password",
  [
    protect,
    admin,
    manager([
      "view_purchases",
      "create_purchases",
      "approve_purchases",
      "delete_purchases",
      "view_reports",
      "manage_vendors",
      "manage_users",
      "sales",
    ]),
    accountant([
      "view_purchases",
      "create_purchases",
      "approve_purchases",
      "delete_purchases",
      "view_reports",
      "manage_vendors",
    ]),
  ],
  changePassword
);
// Update profile
router.put(
  "/update-profile",
  [
    protect,
    check("name", "Name is required").optional(),
    check("email", "Please include a valid email").optional().isEmail(),
  ],
  updateProfile
);

module.exports = router;
