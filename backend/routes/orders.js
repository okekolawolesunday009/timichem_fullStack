const express = require("express")
const { check } = require("express-validator")
const { checkout, getUserOrders, getAllOrders,getTodaySales, getOrder, updateOrderStatus } = require("../controllers/orders")
const { protect, admin } = require("../middleware/auth")

const router = express.Router()

// Get user orders
router.get("/", protect, getUserOrders)

// Get all orders (admin)
router.get("/admin", [protect, admin], getAllOrders)

// Get single order
router.get("/sales", protect, getTodaySales)

// Get single order
router.get("/:id", protect, getOrder)


// Create order (checkout)
router.post(
  "/",
  [protect, check("paymentMethod", "Payment method is required").isIn(["cash", "card", "room-charge"])],
  checkout,
)

// Update order status (admin)
router.put(
  "/:id",
  [protect, admin, check("status", "Status is required").isIn(["pending", "completed", "cancelled"])],
  updateOrderStatus,
)

module.exports = router

