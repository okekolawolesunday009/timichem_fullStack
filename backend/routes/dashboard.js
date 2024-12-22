const express = require("express");
const {
  getDashboardOverview,
  getRecentTransactions,
  getSalesStats,
} = require("../controllers/dashboard");
const { protect, admin, manager, accountant } = require("../middleware/auth");

const router = express.Router();


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


// Get dashboard overview
router.get(
  "/overview",
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
  getDashboardOverview
);

// Get recent transactions
router.get(
  "/transactions",
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
  getRecentTransactions
);

// Get sales statistics
router.get(
  "/sales-stats",
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
  getSalesStats
);

module.exports = router;
