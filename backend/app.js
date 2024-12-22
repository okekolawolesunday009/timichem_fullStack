const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
// const helmet = require("helmet")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")
const winston = require("winston")
const path = require("path")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const productRoutes = require("./routes/products")
const cartRoutes = require("./routes/cart")
const orderRoutes = require("./routes/orders")
const dashboardRoutes = require("./routes/dashboard")

// Initialize express app
const app = express()

// Logger configuration
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
})

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
// app.use(helmet())
app.use(morgan("combined"))

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
})

// Apply rate limiting to authentication routes
app.use("/api/auth", apiLimiter)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/products", productRoutes)
app.use("/api/cart", cartRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/dashboard", dashboardRoutes)
// Routes
app.use("/api/purchases", require("./routes/purchases"))
app.use("/api/vendors", require("./routes/vendors"))
app.use("/api/reports", require("./routes/reports"))

// Serve static files (for barcode images if needed)
app.use("/public", express.static(path.join(__dirname, "public")))

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : {},
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB")

    // Start server
    const PORT = process.env.PORT || 5000
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err.message)
    process.exit(1)
  })

module.exports = app

