const mongoose = require("mongoose")

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    alternatePhone: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: "USA",
      },
    },
    taxId: {
      type: String,
    },
    paymentTerms: {
      type: String,
      enum: ["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"],
      default: "Net 30",
    },
    bankDetails: {
      bankName: String,
      accountNumber: String,
      routingNumber: String,
      accountType: {
        type: String,
        enum: ["checking", "savings"],
      },
    },
    categories: [
      {
        type: String,
        enum: [
          "materials",
          "labor",
          "manufacturing",
          "salaries",
          "rent",
          "utilities",
          "marketing",
          "insurance",
          "other",
        ],
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      trim: true,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastPurchaseDate: {
      type: Date,
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
vendorSchema.index({ name: 1 })
vendorSchema.index({ email: 1 })
vendorSchema.index({ status: 1 })

module.exports = mongoose.model("Vendor", vendorSchema)
