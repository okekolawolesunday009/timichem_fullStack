const express = require("express")
const { check } = require("express-validator")
const { addToCart, getCart, removeFromCart, updateCartItem, clearCart } = require("../controllers/cart")
const { protect, admin, manager  } = require("../middleware/auth")

const router = express.Router()

// Get cart
router.get("/", protect, getCart)

const managerPermissions = [
  "view_purchases",
  "create_purchases",
  "approve_purchases",
  "delete_purchases",
  "view_reports",
  "manage_vendors",
  "manage_users",
  "sales",
];
accountantPermission= [
      "view_purchases",
      "create_purchases",
      "approve_purchases",
      "delete_purchases",
      "view_reports",
      "manage_vendors",
    ],


// Add to cart
router.post(
  "/add",
  [
    protect,
    admin,
    manager(managerPermissions),
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

