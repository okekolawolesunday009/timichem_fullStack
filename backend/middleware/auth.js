const jwt = require("jsonwebtoken")
const User = require("../models/User")

// Middleware to verify JWT token
const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    // console.log(user)

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized" })
  }
}

const manager = (permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Access denied" })
    if (req.user.role === "manager") return next()

    const hasPermission = permissions.some((permission) =>
      req.user.permissions.includes(permission)
    )

    if (!hasPermission) return res.status(403).json({ message: "Insufficient permissions" })
    next()
  }
}

const accountant = (permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Access denied" })
    if (req.user.role === "accountant") return next()

    const hasPermission = permissions.some((permission) =>
      req.user.permissions.includes(permission)
    )

    if (!hasPermission) return res.status(403).json({ message: "Insufficient permissions" })
    next()
  }
}

const sales = (permissions) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Access denied" })
    if (req.user.role === "user") return next()

    const hasPermission = permissions.some((permission) =>
      req.user.permissions.includes(permission)
    )

    if (!hasPermission) return res.status(403).json({ message: "Insufficient permissions" })
    next()
  }
}

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next()
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    })
  }
}

// Export all at once
module.exports = {
  protect,
  admin,
  manager,
  accountant,
  sales,
}
