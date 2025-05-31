const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a product name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
    min: [0, "Price must be greater than 0"],
  },
  barcode: {
    type: String,
    required: [true, "Please add a barcode"],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, "Please add a category"],
    enum: ["spirits", "wine", "beer", "mixers", "other", "bitters", "energy drink","milk", "soda", "juice"],
  },
  stock: {
    type: Number,
    required: [true, "Please add stock quantity"],
    min: [0, "Stock cannot be negative"],
  },
   stockHistory: [
    {
      quantityAdded: {
        type: Number,
        required: true,
      },
      previousStock: {
        type: Number,
        required: true,
      },
      newStock: {
        type: Number,
        required: true,
      },
      addedBy: {
      type: String,
      default: "user in", // or "admin", or any default username
    },
    note: {
      type: String,
      default: "Stock update", // generic note
    },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  image: {
    type: String,
    default: "no-image.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field on save
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("Product", ProductSchema)

