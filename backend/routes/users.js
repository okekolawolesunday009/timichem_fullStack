const express = require("express");
const { check } = require("express-validator");
const { AddUser, getUsers } = require("../controllers/users");
const { protect, admin, manager } = require("../middleware/auth");

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


router.post(
  "/",
  [
    protect, // ensure user is logged in
    admin, // allow only admin
    manager(managerPermissions), // if you want to allow managers with specific permissions
    check("firstName", "First name is required").not().isEmpty(),
    check("lastName", "Last name is required").not().isEmpty(),
    check("department", "Department is required").not().isEmpty(),
    check("role", "Role is required").not().isEmpty(),
    check("email", "A valid email is required").isEmail(),
    check("password", "Password is required").not().isEmpty(),
  ],
  AddUser
);


router.get(
  "/",
  [
   
   
  ],
 getUsers
);

module.exports = router;
