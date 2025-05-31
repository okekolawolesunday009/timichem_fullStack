const express = require("express")
const { getDashboardOverview, getRecentTransactions, getSalesStats } = require("../controllers/dashboard")
const { protect, admin } = require("../middleware/auth")

const router = express.Router()

// Get dashboard overview
router.get("/overview", [protect, admin], getDashboardOverview)

// Get recent transactions
router.get("/transactions", [protect, admin], getRecentTransactions)

// Get sales statistics
router.get("/sales-stats", [protect, admin], getSalesStats)

module.exports = router

