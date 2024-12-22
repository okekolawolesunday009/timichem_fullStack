const express = require("express");
const router = express.Router();
const purchaseController = require("../controllers/purchase");
// const { auth, authorize } = require("../controllers/auth")
const { body, query } = require("express-validator");
const {
  protect,
  admin,
  manager,
  // sales,
  accountant,
} = require("../middleware/auth");

 const managersPermission = [
  "view_purchases",
      "create_purchases",
      "approve_purchases",
      "delete_purchases",
      "view_reports",
      "manage_vendors",
      "sales",
    
];
const accountantPermission = [
      "view_purchases",
      "create_purchases",
      "approve_purchases",
      "delete_purchases",
      "view_reports",
      "manage_vendors",
    ]

// Validation rules
const createPurchaseValidation = [
  body("vendor").isMongoId().withMessage("Valid vendor ID is required"),
  body("category")
    .isIn([
      "materials",
      "labor",
      "manufacturing",
      "salaries",
      "rent",
      "utilities",
      "marketing",
      "insurance",
      "other",
    ])
    .withMessage("Invalid category"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.description")
    .notEmpty()
    .withMessage("Item description is required"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),
  body("items.*.unitPrice")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be non-negative"),
  body("purchaseDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid purchase date"),
  body("expectedDeliveryDate")
    .optional()
    .isISO8601()
    .withMessage("Invalid delivery date"),
  body("paymentTerms")
    .optional()
    .isIn(["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"]),
];

const updatePurchaseValidation = [
  body("status")
    .optional()
    .isIn(["pending", "approved", "ordered", "received", "paid", "cancelled"]),
  body("paymentDate").optional().isISO8601(),
  body("actualDeliveryDate").optional().isISO8601(),
  body("invoiceNumber").optional().isString(),
];

const queryValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status")
    .optional()
    .isIn(["pending", "approved", "ordered", "received", "paid", "cancelled"]),
  query("category")
    .optional()
    .isIn([
      "materials",
      "labor",
      "manufacturing",
      "salaries",
      "rent",
      "utilities",
      "marketing",
      "insurance",
      "other",
    ]),
  query("startDate").optional().isISO8601(),
  query("endDate").optional().isISO8601(),
  query("search").optional().isString(),
];

// Routes
router.get(
  "/",
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
  queryValidation,
  purchaseController.getAllPurchases
);
router.get(
  "/analytics",
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
  purchaseController.getPurchaseAnalytics
);
router.get(
  "/:id",
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
  purchaseController.getPurchaseById
);
router.post(
  "/",
  [protect, ],
  createPurchaseValidation,
  purchaseController.createPurchase
);
router.put(
  "/bulk",
  [
    protect,
    admin,
    manager(managersPermission),
    accountant(accountantPermission),
  ],
  purchaseController.bulkUpdatePurchases
);
router.put(
  "/:id",
  [
    protect,
    admin,
        manager(managersPermission),

    accountant(accountantPermission)
  ],
  updatePurchaseValidation,
  purchaseController.updatePurchase
);
router.delete(
  "/:id",
  [
    protect,
    admin,
      manager(managersPermission),

    accountant(accountantPermission)
  ],
  purchaseController.deletePurchase
);

module.exports = router;
