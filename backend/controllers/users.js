const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Register user
// @route   POST /api/auth/add-user
// @access  Protected (Admin/Manager/etc.)
exports.AddUser = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, password, role, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Set permissions based on role
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
          "sales"
        ];
        break;
      case "accountant":
        permissions = ["view_purchases", "create_purchases", "view_reports"];
        break;
      default:
        permissions = ["sales"];
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // make sure password hashing is handled in User model (e.g., in pre-save hook)
      role: role || "user",
      department: department || "user",
      permissions,
    });

    // Send success response
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

  } catch (error) {
    next(error); // this should call your global error handler
  }
};



// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getUsers = async (req, res, next) => {
  try {
    const user = await User.findOne(req.user?.id)
    console.log(user)

    if (user?.role !== "admin" && user?.role !== "manager") {
      return res.status(404).json({
        success: false,
        message: "Access denied Admins or managers Access Only",
      });
    }

   const users = await User.find({ _id: { $ne:user?._id } }).select("-password -__v");

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};