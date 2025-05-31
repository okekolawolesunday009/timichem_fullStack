const Product = require("../models/Product");
const { validationResult } = require("express-validator");
const bwipjs = require("bwip-js");
const fs = require("fs");
const path = require("path");


// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res, next) => {
  try {
    // Pagination

    const page = Number.parseInt(req.query.page, 10) || 1;
    const limit = Number.parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments();

    // Filtering
    const query = {};

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.search) {
      query.name = { $regex: req.query.search, $options: "i" };
    }

    // Execute query
    const products = await Product.find(query)
      .skip(startIndex)
      // .limit(limit)
      .sort({ createdAt: -1 });

      // console.log(products)
    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      pagination,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }
    const {
      name,
      description,
      price,
      barcode,
      category,
      stock,

      image,
    } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      barcode,
      category,
      stock,
      image,
    });

    res.status(201).json({
      success: true,
     product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.updateProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { name, description, price, barcode, category, stock, image } = req.body;

    const previousStock = product.stock;
    const quantityAdded = Number(stock); // ensure it's a number
    const newStock = previousStock + quantityAdded;

    // Update stock value
    product.stock = newStock;

    // Push stock history entry
    product.stockHistory.push({
      quantityAdded,
      previousStock,
      newStock,
      note:  "Stock updated",
      addedBy: req.user?.name || "system",
    });

    // Update other fields
    product.name = name;
    product.description = description;
    product.price = price;
    product.barcode = barcode;
    product.category = category;
    product.image = image;

    // Save the updated product
    await product.save();


    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by barcode
// @route   GET /api/products/barcode/:code
// @access  Private
exports.getProductByBarcode = async (req, res, next) => {
  try {
    const product = await Product.findOne({ barcode: req.params.code });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
     product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate barcode for product
// @route   POST /api/products/generate-barcode
// @access  Private/Admin
exports.generateBarcode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { text } = req.body;

    // Generate a unique barcode if not provided
    const barcodeText = text || `HB${Date.now()}`;

    // Check if barcode already exists
    const existingProduct = await Product.findOne({ barcode: barcodeText });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Barcode already exists",
      });
    }

    // Generate barcode image
    const barcodeDir = path.join(__dirname, "../public/barcodes");

    // Create directory if it doesn't exist
    if (!fs.existsSync(barcodeDir)) {
      fs.mkdirSync(barcodeDir, { recursive: true });
    }

    const barcodeFile = `${barcodeText}.png`;
    const barcodePath = path.join(barcodeDir, barcodeFile);

    // Generate barcode using bwip-js
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text: barcodeText,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: "center",
      },
      (err, png) => {
        if (err) {
          return next(err);
        }

        // Save barcode image
        fs.writeFileSync(barcodePath, png);

        res.status(200).json({
          success: true,
          data: {
            barcode: barcodeText,
            imageUrl: `/public/barcodes/${barcodeFile}`,
          },
        });
      }
    );
  } catch (error) {
    next(error);
  }
};
