const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    purchaseOrderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0");
        return `PO-${year}-${random}`;
      },
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    category: {
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
        "depreciation",
        "other",
      ],
      required: true,
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        totalPrice: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    purchaseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "ordered", "received", "paid", "cancelled"],
      default: "pending",
    },
    paymentTerms: {
      type: String,
      enum: ["Net 15", "Net 30", "Net 60", "Due on Receipt", "COD"],
      default: "Net 30",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid", "overdue"],
      default: "unpaid",
    },
    paymentDate: {
      type: Date,
    },
    invoiceNumber: {
      type: String,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalDate: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
purchaseSchema.index({ purchaseDate: -1 });
purchaseSchema.index({ vendor: 1 });
purchaseSchema.index({ category: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

// Virtual for days since purchase
purchaseSchema.virtual("daysSincePurchase").get(function () {
  return Math.floor((Date.now() - this.purchaseDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to calculate total amount
purchaseSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      item.totalPrice = item.quantity * item.unitPrice;
      return total + item.totalPrice;
    }, 0);
  }
  next();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
