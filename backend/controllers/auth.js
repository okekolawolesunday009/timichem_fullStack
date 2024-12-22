const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, password} = req.body;

   const existingUser = await User.findOne({ email });

if (existingUser) {

      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }
    

    // Set default permissions based on role
    let permissions = [];
    switch (role) {
      case "admin":
        permissions = [
          "view_purchases",
          "create_purchases",
          "approve_purchases",
          "delete_purchases",
          "view_reports",
          "manage_vendors",
          "manage_users",
        ];
        break;
      case "manager":
        permissions = [
          "view_purchases",
          "create_purchases",
          "approve_purchases",
          "view_reports",
          "manage_vendors",
        ];
        break;
      case "accountant":
        permissions = ["view_purchases", "create_purchases", "view_reports"];
        break;
      default:
        permissions = ["sales"];
    }

   const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || "user",
      department: department || "user",
      permissions,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        permissions: user.permissions,
      },
    });
   

    sendTokenResponse(user, 201, res);
    return res.success
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    // console.log(req.body)

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated. Please contact administrator.",
        })
      }
      // Update last login
      user.lastLogin = new Date()
      await user.save()

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, email } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    // Update user
    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const { currentPassword, newPassword } = req.body

      const user = await User.findById(req.user.id).select("+password")

      // Verify current password
      const isCurrentPasswordValid = await user.matchPassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Update password
      user.password = newPassword
      await user.save()

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      res.status(500).json({
        success: false,
        message: "Failed to change password",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  console.log(token);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};


