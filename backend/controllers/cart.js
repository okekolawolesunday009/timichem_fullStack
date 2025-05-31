const Cart = require("../models/Cart")
const Product = require("../models/Product")
const { validationResult } = require("express-validator")

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const { productId, quantity } = req.body
    // console.log(req.user)
    console.log( productId, quantity );


    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      })
    }

    // Check if quantity is available
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      })
    }

    // Find user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: req.user.id,
        items: [
          {
            product: productId,
            quantity,
            price: product.price,
          },
        ],
        total: product.price * quantity,
      })
    } else {
      // Check if product already in cart
      const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

      if (itemIndex > -1) {
        // Update existing item
        cart.items[itemIndex].quantity += quantity
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        })
      }

      // Calculate total
      cart.total = cart.items.reduce((total, item) => {
        return total + item.price * item.quantity
      }, 0)
    }

    await cart.save()

    // Update product stock
    // await Product.findByIdAndUpdate(productId, {
    //   $inc: { stock: -quantity }, // Decrease stock
    // })

    // Populate product details
    await cart.populate("items.product")
    console.log(cart)

    res.status(200).json({
      success: true,
      cart,
    })
  } catch (error) {
    next(error)
  }
}


// @desc    Get cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product")

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          items: [],
          total: 0,
        },
      })
    }

    res.status(200).json({
      success: true,
       cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const productId = req.params.productId;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item index
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    const item = cart.items[itemIndex];

    // Update product stock
    // await Product.findByIdAndUpdate(productId, {
    //   $inc: { stock: item.quantity },
    // });

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);

    await cart.save();

    // Populate product details
    await cart.populate("items.product");

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      })
    }

    const productId = req.params.productId
    const { quantity } = req.body

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id })

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      })
    }

    // Find item index
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId)

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      })
    }

    // Check if product has enough stock
    const product = await Product.findById(productId)
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock available",
      })
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity

    // Recalculate total
    cart.total = cart.items.reduce((total, item) => {
      return total + item.price * item.quantity
    }, 0)

    await cart.save()

    // Populate product details
    await cart.populate("items.product")

    res.status(200).json({
      success: true,
      cart,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  //  console.log(req.user, "kk")
  //  const cart = await Cart.findOneAndDelete({ user: req.user.id })
  //   console.log(cart)
  try {
    // Find and remove user's cart
  
   if (req.user) {
    // console.log(req.user)
        // console.log(req.user.id, "id not")

   }
    // const cart = await Cart.findOne({ user: req.user.id })
    const cart = await Cart.findOneAndDelete({ user: req.user.id })
    console.log(cart)

    

    res.status(200).json({
      success: true,
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

