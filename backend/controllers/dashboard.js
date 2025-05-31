const Order = require("../models/Order")
const Product = require("../models/Product")
const mongoose = require("mongoose")

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private/Admin
exports.getDashboardOverview = async (req, res, next) => {
  try {
    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get total revenue
    const totalRevenue = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])

    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])

    // Get daily revenue
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: today },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])

    // Get total orders
    const totalOrders = await Order.countDocuments()

    // Get pending orders
    const pendingOrders = await Order.countDocuments({ status: "pending" })

    // Get low stock products (less than 5)
    const lowStockProducts = await Product.find({ stock: { $lt: 5 } })
      .select("name stock category")
      .sort({ stock: 1 })

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ])

    // Get sales by category
    const salesByCategory = await Order.aggregate([
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { revenue: -1 } },
    ])

    res.status(200).json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          monthly: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
          daily: dailyRevenue.length > 0 ? dailyRevenue[0].total : 0,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
        },
        products: {
          lowStock: lowStockProducts,
          topSelling: topSellingProducts,
        },
        salesByCategory,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get recent transactions
// @route   GET /api/dashboard/transactions
// @access  Private/Admin
exports.getRecentTransactions = async (req, res, next) => {
  try {
    // Get recent orders
    const recentOrders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(10)

    res.status(200).json({
      success: true,
      recentOrders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get sales statistics
// @route   GET /api/dashboard/sales-stats
// @access  Private/Admin
exports.getSalesStats = async (req, res, next) => {
  try {
    // Get start and end date for the last 7 days
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 6)

    // Initialize days array
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push({
        date: date.toISOString().split("T")[0],
        revenue: 0,
        orders: 0,
      })
    }

    // Get daily sales for the last 7 days
    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Map sales data to days array
    const salesStats = days.map((day) => {
      const sale = dailySales.find((s) => s._id === day.date)
      return {
        date: day.date,
        revenue: sale ? sale.revenue : 0,
        orders: sale ? sale.orders : 0,
      }
    })

    res.status(200).json({
      success: true,
      salesStats,
    })
  } catch (error) {
    next(error)
  }
}

