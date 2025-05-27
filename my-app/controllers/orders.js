const Order = require("../models/Order")
const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { validationResult } = require("express-validator")

// @desc    Create new order (checkout)
// @route   POST /api/orders/checkout
// @access  Private
exports.checkout = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { paymentMethod } = req.body
    // console.log(req.body)
    

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product")

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      })
    }

    // Check if all products are in stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product)

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`,
        })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}`,
        })
      }
    }

    // Create order items with product details
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
    }))

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total: cart.total,
      paymentMethod,
    })

    // Update product stock
    // for (const item of cart.items) {
    //   await Product.findByIdAndUpdate(item.product._id, {
    //     $inc: { stock: -item.quantity },
    //   })
    // }

    // Clear the cart
    await Cart.findByIdAndDelete(cart._id)

    res.status(201).json({
      success: true,
      order,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    // Pagination
    const page = Number.parseInt(req.query.page, 10) || 1
    const limit = Number.parseInt(req.query.limit, 10) || 10
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const total = await Order.countDocuments()

    // Execute query
    const orders = await Order.find()
      .populate("user", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 })

    // Pagination result
    const pagination = {}

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      }
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      }
    }

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination,
      data: orders,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    // Check if user is admin or order belongs to user
    if (req.user.role !== "admin" && order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      })
    }

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { status } = req.body

    let order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      })
    }

    order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true })

    res.status(200).json({
      success: true,
      data: order,
    })
  } catch (error) {
    next(error)
  }
}

