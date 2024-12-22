const express = require("express");
const router = express.Router();
const reportController = require("../controllers/report");
const {
  protect,
  admin,
  manager,
  sales,
  accountant,
} = require("../middleware/auth");
const { query } = require("express-validator");

// Validation rules
const reportValidation = [
  query("startDate").isISO8601().withMessage("Valid start date is required"),
  query("endDate").isISO8601().withMessage("Valid end date is required"),
  query("period")
    .optional()
    .isIn(["daily", "weekly", "monthly", "quarterly", "yearly"]),
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
  "/profit-loss",
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
  reportValidation,
  reportController.getProfitLossReport
);
router.get(
  "/cash-flow",
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
  reportValidation,
  reportController.getCashFlowReport
);
router.get(
  "/expenses",
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
  reportValidation,
  reportController.getExpenseReport
);

module.exports = router;
