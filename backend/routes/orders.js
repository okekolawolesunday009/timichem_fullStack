const express = require("express");
const { check } = require("express-validator");
const {
  checkout,
  getUserOrders,
  getAllOrders,
  getTodaySales,
  getOrder,
  updateOrderStatus,
} = require("../controllers/orders");
const {
  protect,
  admin,
  manager,
  sales,
  accountant,
} = require("../middleware/auth");

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


// Get user orders
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

    sales(["sales"]),
  ],
  getUserOrders
);

// Get all orders (admin)
router.get(
  "/admin",
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

    sales(["sales"]),
  ],
  getAllOrders
);

// Get single order
router.get(
  "/sales",
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

    sales(["sales"]),
  ],
  getTodaySales
);

// Get single order
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

    sales(["sales"]),
  ],
  getOrder
);

// Create order (checkout)
router.post(
  "/",
  [
    protect,
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

    sales(["sales"]),
    check("paymentMethod", "Payment method is required").isIn([
      "cash",
      "card",
      "room-charge",
    ]),
  ],
  checkout
);

// Update order status (admin)
router.put(
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

    sales(["sales"]),

    check("status", "Status is required").isIn([
      "pending",
      "completed",
      "cancelled",
    ]),
  ],
  updateOrderStatus
);

module.exports = router;
