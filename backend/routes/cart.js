const express = require("express")
const { check } = require("express-validator")
const { addToCart, getCart, removeFromCart, updateCartItem, clearCart } = require("../controllers/cart")
const { protect } = require("../middleware/auth")

const router = express.Router()

// Get cart
router.get("/", protect, getCart)

// Add to cart
router.post(
  "/add",
  [
    protect,
    check("productId", "Product ID is required").not().isEmpty(),
    check("quantity", "Quantity must be at least 1").isInt({ min: 1 }),
  ],
  addToCart,
)

// Remove from cart
router.delete("/:productId", protect, removeFromCart)

// Update cart item
router.put("/:productId", [protect, check("quantity", "Quantity must be at least 1").isInt({ min: 1 })], updateCartItem)

// Clear cart
router.delete("/clear", protect, clearCart)

module.exports = router

