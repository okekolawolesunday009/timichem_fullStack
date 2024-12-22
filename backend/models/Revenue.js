const mongoose = require("mongoose")

const revenueSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ["productSales", "serviceSales", "otherIncome"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    customer: {
      name: String,
      email: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    },
    product: {
      name: String,
      sku: String,
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
    quantity: {
      type: Number,
      default: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    revenueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit_card", "debit_card", "bank_transfer", "check", "other"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "refunded", "cancelled"],
      default: "completed",
    },
    refundAmount: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
revenueSchema.index({ revenueDate: -1 })
revenueSchema.index({ type: 1 })
revenueSchema.index({ status: 1 })
revenueSchema.index({ "customer.id": 1 })

module.exports = mongoose.model("Revenue", revenueSchema)
