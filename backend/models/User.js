const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const UserSchema = new mongoose.Schema({
 firstName: {
    type: String,
    required: [true, "Please add first name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please add last name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false,
  },
   role: {
      type: String,
      enum: ["admin", "manager", "accountant", "user"],
      default: "user",
    },
    permissions: [
      {
        type: String,
        enum: [
          "view_purchases",
          "create_purchases",
          "approve_purchases",
          "delete_purchases",
          "view_reports",
          "manage_vendors",
          "manage_users",
          "sales"
        ],
      },
    ],
    department: {
      type: String,
      enum: ["finance", "operations", "sales", "marketing", "hr", "it"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    profileImage: {
      type: String,
    },
    createdAt: {
    type: Date,
    default: Date.now,
  }
})

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", UserSchema)

