const express = require("express");
const router = express.Router();
const vendorController = require("../controllers/vendor");
const {
  protect,
  admin,
  manager,
  sales,
  accountant,
} = require("../middleware/auth");
const { body, query } = require("express-validator");

// Validation rules
const createVendorValidation = [
  body("name").notEmpty().trim().withMessage("Vendor name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("companyName").optional().trim(),
  body("address.street").optional().trim(),
  body("address.city").optional().trim(),
  body("address.state").optional().trim(),
  body("address.zipCode").optional().trim(),
  body("paymentTerms")
    .optional()
    .isIn(["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"]),
];

const updateVendorValidation = [
  body("name").optional().notEmpty().trim(),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional().notEmpty(),
  body("status").optional().isIn(["active", "inactive", "suspended"]),
];

const queryValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["active", "inactive", "suspended"]),
  query("search").optional().isString(),
];

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

// Routes
router.get(
  "/",
  [
    protect,
    admin,
    manager(managerPermissions),
    accountant(accountantPermission),
  ],
  queryValidation,
  vendorController.getAllVendors
);
router.get(
  "/analytics",
  [
    protect,
    admin,
    manager(managerPermissions),
    accountant(accountantPermission),
  ],
  vendorController.getVendorAnalytics
);
router.get(
  "/:id",
  [
    protect,
    admin,
   manager(managerPermissions),
    accountant(accountantPermission),
  ],
  vendorController.getVendorById
);
router.post(
  "/",
  [
    protect,
    admin,
    manager(managerPermissions),
    accountant(accountantPermission),
  ],
  createVendorValidation,
  vendorController.createVendor
);
router.put(
  "/:id",
  [
    protect,
    admin,
    manager(managerPermissions),
    accountant(accountantPermission),
  ],
  updateVendorValidation,
  vendorController.updateVendor
);
router.delete(
  "/:id",
  [
    protect,
    admin,
   manager(managerPermissions),
    accountant(accountantPermission),
  ],
  vendorController.deleteVendor
);

module.exports = router;
