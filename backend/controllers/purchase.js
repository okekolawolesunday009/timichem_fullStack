const Purchase = require("../models/Purchase")
const Vendor = require("../models/Vendor")
const { validationResult } = require("express-validator")

class PurchaseController {
  // Get all purchases with filtering and pagination
  async getAllPurchases(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const {
        page = 1,
        limit = 10,
        status,
        category,
        startDate,
        endDate,
        search,
        vendor,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query

      // Build filter object
      const filter = {}

      if (status) filter.status = status
      if (category) filter.category = category
      if (vendor) filter.vendor = vendor

      if (startDate || endDate) {
        filter.purchaseDate = {}
        if (startDate) filter.purchaseDate.$gte = new Date(startDate)
        if (endDate) filter.purchaseDate.$lte = new Date(endDate)
      }

      if (search) {
        filter.$or = [
          { description: { $regex: search, $options: "i" } },
          { purchaseOrderNumber: { $regex: search, $options: "i" } },
          { invoiceNumber: { $regex: search, $options: "i" } },
        ]
      }

      const skip = (page - 1) * limit
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

      const purchases = await Purchase.find(filter)
        .populate("vendor", "name email phone companyName")
        .populate("createdBy", "firstName lastName email")
        .populate("approvedBy", "firstName lastName email")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number.parseInt(limit))

      const total = await Purchase.countDocuments(filter)

      // Calculate summary statistics
      const totalAmount = await Purchase.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ])

      const statusCounts = await Purchase.aggregate([
        { $match: filter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])

      res.json({
        success: true,
        data: {
          purchases,
          pagination: {
            current: Number.parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: Number.parseInt(limit),
          },
          summary: {
            totalAmount: totalAmount[0]?.total || 0,
            statusCounts: statusCounts.reduce((acc, item) => {
              acc[item._id] = item.count
              return acc
            }, {}),
          },
        },
      })
    } catch (error) {
      console.error("Error fetching purchases:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch purchases",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Get purchase by ID
  async getPurchaseById(req, res) {
    try {
      const { id } = req.params

      const purchase = await Purchase.findById(id)
        .populate("vendor")
        .populate("createdBy", "firstName lastName email")
        .populate("approvedBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email")

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      res.json({
        success: true,
        data: purchase,
      })
    } catch (error) {
      console.error("Error fetching purchase:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch purchase",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Create new purchase
  async createPurchase(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      // Verify vendor exists
      const vendor = await Vendor.findById(req.body.vendor)
      if (!vendor) {
        return res.status(400).json({
          success: false,
          message: "Vendor not found",
        })
      }

      // Generate unique PO number if not provided
      if (!req.body.purchaseOrderNumber) {
        const year = new Date().getFullYear()
        const count = await Purchase.countDocuments({
          purchaseOrderNumber: { $regex: `^PO-${year}-` },
        })
        req.body.purchaseOrderNumber = `PO-${year}-${String(count + 1).padStart(3, "0")}`
      }

      const purchase = new Purchase({
        ...req.body,
        purchaseDate:  new Date(),
        createdBy: req.user.id,
      })

      await purchase.save()
      await purchase.populate("vendor", "name email phone companyName")
      await purchase.populate("createdBy", "firstName lastName email")

      // Update vendor statistics
      await Vendor.findByIdAndUpdate(req.body.vendor, {
        // $inc: {
        //   totalPurchases: 1,
        //   totalSpent: purchase.totalAmount,
        // },
        lastPurchaseDate: purchase.purchaseDate,
      })

      res.status(201).json({
        success: true,
        message: "Purchase created successfully",
        purchase,
      })
    } catch (error) {
      console.error("Error creating purchase:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create purchase",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Update purchase
  async updatePurchase(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const { id } = req.params
      const purchase = await Purchase.findById(id)

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      // Check permissions for status changes
      if (req.body.status && req.body.status !== purchase.status) {
        if (req.body.status === "approved" && !req.user.permissions.includes("approve_purchases")) {
          return res.status(403).json({
            success: false,
            message: "Insufficient permissions to approve purchases",
          })
        }

        // Handle status-specific updates
        if (req.body.status === "approved" && !purchase.approvedBy) {
          req.body.approvedBy = req.user.id
          req.body.approvalDate = new Date()
        }

        if (req.body.status === "paid" && !req.body.paymentDate) {
          req.body.paymentDate = new Date()
          req.body.paymentStatus = "paid"
        }

        if (req.body.status === "received" && !req.body.actualDeliveryDate) {
          req.body.actualDeliveryDate = new Date()
        }
      }

      req.body.updatedBy = req.user.id

      const updatedPurchase = await Purchase.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
        .populate("vendor", "name email phone companyName")
        .populate("createdBy", "firstName lastName email")
        .populate("approvedBy", "firstName lastName email")
        .populate("updatedBy", "firstName lastName email")

      res.json({
        success: true,
        message: "Purchase updated successfully",
        data: updatedPurchase,
      })
    } catch (error) {
      console.error("Error updating purchase:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update purchase",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Delete purchase
  async deletePurchase(req, res) {
    try {
      const { id } = req.params
      const purchase = await Purchase.findById(id)

      if (!purchase) {
        return res.status(404).json({
          success: false,
          message: "Purchase not found",
        })
      }

      // Only allow deletion of pending purchases
      if (purchase.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending purchases can be deleted",
        })
      }

      await Purchase.findByIdAndDelete(id)

      // Update vendor statistics
      await Vendor.findByIdAndUpdate(purchase.vendor, {
        $inc: {
          totalPurchases: -1,
          totalSpent: -purchase.totalAmount,
        },
      })

      res.json({
        success: true,
        message: "Purchase deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting purchase:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete purchase",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Get purchase analytics
  async getPurchaseAnalytics(req, res) {
    try {
      const { startDate, endDate, period = "monthly" } = req.query

      const matchStage = {}
      if (startDate || endDate) {
        matchStage.purchaseDate = {}
        if (startDate) matchStage.purchaseDate.$gte = new Date(startDate)
        if (endDate) matchStage.purchaseDate.$lte = new Date(endDate)
      }

      // Total purchases by category
      const categoryTotals = await Purchase.aggregate([
        { $match: { ...matchStage, status: { $in: ["received", "paid"] } } },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
        { $sort: { totalAmount: -1 } },
      ])

      // Monthly trends
      const monthlyTrends = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              year: { $year: "$purchaseDate" },
              month: { $month: "$purchaseDate" },
            },
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])

      // Status summary
      const statusSummary = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ])

      // Top vendors by spending
      const topVendors = await Purchase.aggregate([
        { $match: { ...matchStage, status: { $in: ["received", "paid"] } } },
        {
          $group: {
            _id: "$vendor",
            totalAmount: { $sum: "$totalAmount" },
            count: { $sum: 1 },
            avgAmount: { $avg: "$totalAmount" },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "vendors",
            localField: "_id",
            foreignField: "_id",
            as: "vendorInfo",
          },
        },
        {
          $project: {
            totalAmount: 1,
            count: 1,
            avgAmount: 1,
            vendor: { $arrayElemAt: ["$vendorInfo", 0] },
          },
        },
      ])

      // Payment terms analysis
      const paymentTermsAnalysis = await Purchase.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$paymentTerms",
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ])

      // Overdue purchases (for paid status)
      const overduePurchases = await Purchase.aggregate([
        {
          $match: {
            status: { $in: ["approved", "received"] },
            $expr: {
              $gt: [
                { $dateDiff: { startDate: "$purchaseDate", endDate: new Date(), unit: "day" } },
                {
                  $switch: {
                    branches: [
                      { case: { $eq: ["$paymentTerms", "Net 15"] }, then: 15 },
                      { case: { $eq: ["$paymentTerms", "Net 30"] }, then: 30 },
                      { case: { $eq: ["$paymentTerms", "Net 60"] }, then: 60 },
                      { case: { $eq: ["$paymentTerms", "Due on Receipt"] }, then: 0 },
                    ],
                    default: 30,
                  },
                },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ])

      res.json({
        success: true,
        data: {
          categoryTotals,
          monthlyTrends,
          statusSummary,
          topVendors,
          paymentTermsAnalysis,
          overduePurchases: overduePurchases[0] || { count: 0, totalAmount: 0 },
        },
      })
    } catch (error) {
      console.error("Error fetching purchase analytics:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch purchase analytics",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Bulk update purchases
  async bulkUpdatePurchases(req, res) {
    try {
      const { purchaseIds, updates } = req.body

      if (!purchaseIds || !Array.isArray(purchaseIds) || purchaseIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Purchase IDs array is required",
        })
      }

      const result = await Purchase.updateMany(
        { _id: { $in: purchaseIds } },
        { ...updates, updatedBy: req.user.id },
        { runValidators: true },
      )

      res.json({
        success: true,
        message: `${result.modifiedCount} purchases updated successfully`,
        data: {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        },
      })
    } catch (error) {
      console.error("Error bulk updating purchases:", error)
      res.status(500).json({
        success: false,
        message: "Failed to bulk update purchases",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }
}

module.exports = new PurchaseController()
