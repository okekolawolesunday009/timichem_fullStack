const express = require("express")
const { check } = require("express-validator")
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductByBarcode,
  generateBarcode,
} = require("../controllers/products")
const { protect, admin } = require("../middleware/auth")

const router = express.Router()

// Get all products
router.get("/", protect, getProducts)

// Get single product
router.get("/:id", protect, getProduct)

// Create product (admin only)
router.post(
  "/",
  [
    protect,
    admin,
    check("name", "Name is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("price", "Price must be a positive number").isFloat({ min: 0 }),
    check("barcode", "Barcode is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
    check("stock", "Stock must be a non-negative number").isInt({ min: 0 }),
  ],
  createProduct,
)

// Update product (admin only)
router.put(
  "/:id",
  [
    protect,
    admin,
    check("name", "Name is required").optional(),
    check("description", "Description is required").optional(),
    check("price", "Price must be a positive number").optional().isFloat({ min: 0 }),
    check("barcode", "Barcode is required").optional(),
    check("category", "Category is required").optional(),
    check("stock", "Stock must be a non-negative number").optional().isInt({ min: 0 }),

  ],
  updateProduct,
)

// Delete product (admin only)
router.delete("/:id", [protect, admin], deleteProduct)

// Get product by barcode
router.get("/barcode/:code", protect, getProductByBarcode)

// Generate barcode
router.post(
  "/generate-barcode",
  [protect, admin, check("text", "Barcode text is optional").optional()],
  generateBarcode,
)

module.exports = router

