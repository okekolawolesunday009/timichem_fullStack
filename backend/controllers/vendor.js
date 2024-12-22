const Vendor = require("../models/Vendor")
const Purchase = require("../models/Purchase")
const { validationResult } = require("express-validator")

class VendorController {
  // Get all vendors with filtering and pagination
  async getAllVendors(req, res) {
    try {
      const { page = 1, limit = 10, status, search, sortBy = "name", sortOrder = "asc" } = req.query

      const filter = {}
      if (status) filter.status = status

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { companyName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ]
      }

      const skip = (page - 1) * limit
      const sortOptions = {}
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

      const vendors = await Vendor.find(filter)
        .populate("createdBy", "firstName lastName")
        .sort(sortOptions)
        .skip(skip)
        .limit(Number.parseInt(limit))

      const total = await Vendor.countDocuments(filter)

      res.json({
        success: true,
        data: {
          vendors,
          pagination: {
            current: Number.parseInt(page),
            pages: Math.ceil(total / limit),
            total,
            limit: Number.parseInt(limit),
          },
        },
      })
    } catch (error) {
      console.error("Error fetching vendors:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendors",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Get vendor by ID
  async getVendorById(req, res) {
    try {
      const { id } = req.params

      const vendor = await Vendor.findById(id).populate("createdBy", "firstName lastName email")

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        })
      }

      // Get vendor's purchase history
      const purchases = await Purchase.find({ vendor: id })
        .select("purchaseOrderNumber totalAmount purchaseDate status")
        .sort({ purchaseDate: -1 })
        .limit(10)

      // Get vendor statistics
      const stats = await Purchase.aggregate([
        { $match: { vendor: vendor._id } },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            avgPurchaseAmount: { $avg: "$totalAmount" },
            lastPurchaseDate: { $max: "$purchaseDate" },
          },
        },
      ])

      res.json({
        success: true,
        data: {
          vendor,
          recentPurchases: purchases,
          statistics: stats[0] || {
            totalPurchases: 0,
            totalSpent: 0,
            avgPurchaseAmount: 0,
            lastPurchaseDate: null,
          },
        },
      })
    } catch (error) {
      console.error("Error fetching vendor:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Create new vendor
  async createVendor(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      // Check if vendor with email already exists
      const existingVendor = await Vendor.findOne({ email: req.body.email })
      if (existingVendor) {
        return res.status(400).json({
          success: false,
          message: "Vendor with this email already exists",
        })
      }

      const vendor = new Vendor({
        ...req.body,
        status: req.body.status || "active",
        rating: req.body.rating || 2,
        lastPurchaseDate: new Date(),
        createdBy: req.user.id,
      })

      await vendor.save()
      await vendor.populate("createdBy", "firstName lastName email")

      res.status(201).json({
        success: true,
        message: "Vendor created successfully",
        vendor,
      })
    } catch (error) {
      console.error("Error creating vendor:", error)
      res.status(500).json({
        success: false,
        message: "Failed to create vendor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Update vendor
  async updateVendor(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        })
      }

      const { id } = req.params

      // Check if email is being changed and if it conflicts
      if (req.body.email) {
        const existingVendor = await Vendor.findOne({
          email: req.body.email,
          _id: { $ne: id },
        })
        if (existingVendor) {
          return res.status(400).json({
            success: false,
            message: "Another vendor with this email already exists",
          })
        }
      }

      const vendor = await Vendor.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate(
        "createdBy",
        "firstName lastName email",
      )

      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        })
      }

      res.json({
        success: true,
        message: "Vendor updated successfully",
        data: vendor,
      })
    } catch (error) {
      console.error("Error updating vendor:", error)
      res.status(500).json({
        success: false,
        message: "Failed to update vendor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Delete vendor
  async deleteVendor(req, res) {
    try {
      const { id } = req.params

      // Check if vendor has any purchases
      const purchaseCount = await Purchase.countDocuments({ vendor: id })
      if (purchaseCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete vendor. ${purchaseCount} purchase(s) are associated with this vendor.`,
        })
      }

      const vendor = await Vendor.findByIdAndDelete(id)
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: "Vendor not found",
        })
      }

      res.json({
        success: true,
        message: "Vendor deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting vendor:", error)
      res.status(500).json({
        success: false,
        message: "Failed to delete vendor",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Get vendor analytics
  async getVendorAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query

      const matchStage = {}
      if (startDate || endDate) {
        matchStage.purchaseDate = {}
        if (startDate) matchStage.purchaseDate.$gte = new Date(startDate)
        if (endDate) matchStage.purchaseDate.$lte = new Date(endDate)
      }

      // Top vendors by spending
      const topVendorsBySpending = await Purchase.aggregate([
        { $match: { ...matchStage, status: { $in: ["received", "paid"] } } },
        {
          $group: {
            _id: "$vendor",
            totalSpent: { $sum: "$totalAmount" },
            purchaseCount: { $sum: 1 },
            avgPurchaseAmount: { $avg: "$totalAmount" },
            lastPurchaseDate: { $max: "$purchaseDate" },
          },
        },
        { $sort: { totalSpent: -1 } },
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
            totalSpent: 1,
            purchaseCount: 1,
            avgPurchaseAmount: 1,
            lastPurchaseDate: 1,
            vendor: { $arrayElemAt: ["$vendorInfo", 0] },
          },
        },
      ])

      // Vendor performance metrics
      const vendorPerformance = await Vendor.aggregate([
        {
          $lookup: {
            from: "purchases",
            localField: "_id",
            foreignField: "vendor",
            as: "purchases",
          },
        },
        {
          $project: {
            name: 1,
            email: 1,
            status: 1,
            totalPurchases: { $size: "$purchases" },
            totalSpent: { $sum: "$purchases.totalAmount" },
            avgPurchaseAmount: { $avg: "$purchases.totalAmount" },
            onTimePurchases: {
              $size: {
                $filter: {
                  input: "$purchases",
                  cond: { $in: ["$$this.status", ["received", "paid"]] },
                },
              },
            },
          },
        },
        {
          $addFields: {
            onTimePercentage: {
              $cond: {
                if: { $gt: ["$totalPurchases", 0] },
                then: { $multiply: [{ $divide: ["$onTimePurchases", "$totalPurchases"] }, 100] },
                else: 0,
              },
            },
          },
        },
        { $sort: { totalSpent: -1 } },
      ])

      // Payment terms distribution
      const paymentTermsDistribution = await Vendor.aggregate([
        {
          $group: {
            _id: "$paymentTerms",
            count: { $sum: 1 },
            vendors: { $push: { name: "$name", id: "$_id" } },
          },
        },
      ])

      // Vendor status distribution
      const statusDistribution = await Vendor.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])

      res.json({
        success: true,
        data: {
          topVendorsBySpending,
          vendorPerformance,
          paymentTermsDistribution,
          statusDistribution,
        },
      })
    } catch (error) {
      console.error("Error fetching vendor analytics:", error)
      res.status(500).json({
        success: false,
        message: "Failed to fetch vendor analytics",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      })
    }
  }

  // Update vendor statistics (called internally)
  async updateVendorStatistics(vendorId) {
    try {
      const stats = await Purchase.aggregate([
        { $match: { vendor: vendorId } },
        {
          $group: {
            _id: null,
            totalPurchases: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
            lastPurchaseDate: { $max: "$purchaseDate" },
          },
        },
      ])

      if (stats.length > 0) {
        await Vendor.findByIdAndUpdate(vendorId, {
          totalPurchases: stats[0].totalPurchases,
          totalSpent: stats[0].totalSpent,
          lastPurchaseDate: stats[0].lastPurchaseDate,
        })
      }
    } catch (error) {
      console.error("Error updating vendor statistics:", error)
    }
  }
}

module.exports = new VendorController()
