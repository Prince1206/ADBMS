const Product = require('../models/Product');

// @desc    Get all products (with optional search/filter)
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, lowStock } = req.query;
    let query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { productName: regex },
        { productCode: regex },
        { category: regex },
        { supplier: regex }
      ];
    }

    if (category) {
      query.category = category;
    }

    let products = await Product.find(query).sort({ createdAt: -1 });

    if (lowStock === 'true') {
      products = products.filter(p => p.quantity <= p.reorderLevel);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: err.message
    });
  }
};

// @desc    Get products that are low on stock
// @route   GET /api/products/low-stock
exports.getLowStockProducts = async (req, res) => {
  try {
    // Mongo $expr query comparing quantity <= reorderLevel
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 });

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      data: lowStockProducts
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching low stock products',
      error: err.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: err.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      productName,
      productCode,
      category,
      supplier,
      quantity,
      price,
      reorderLevel,
      description
    } = req.body;

    // Check duplicate productCode before save
    const existing = await Product.findOne({ productCode: productCode ? productCode.toUpperCase() : '' });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Product code '${productCode.toUpperCase()}' already exists. Please use a unique product code.`
      });
    }

    const product = await Product.create({
      productName,
      productCode,
      category,
      supplier,
      quantity: Number(quantity),
      price: Number(price),
      reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : 10,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: Product code must be unique'
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
      error: err.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const {
      productName,
      productCode,
      category,
      supplier,
      quantity,
      price,
      reorderLevel,
      description
    } = req.body;

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (productCode && productCode.toUpperCase() !== product.productCode) {
      const duplicate = await Product.findOne({ productCode: productCode.toUpperCase() });
      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: `Product code '${productCode.toUpperCase()}' is already taken by another product.`
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName,
        productCode: productCode ? productCode.toUpperCase() : product.productCode,
        category,
        supplier,
        quantity: quantity !== undefined ? Number(quantity) : product.quantity,
        price: price !== undefined ? Number(price) : product.price,
        reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : product.reorderLevel,
        description
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error: Product code must be unique'
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: err.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Product ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: err.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/products/stats
exports.getStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });

    const stockSum = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$quantity' },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } }
        }
      }
    ]);

    const totalStock = stockSum.length > 0 ? stockSum[0].totalStock : 0;
    const totalValue = stockSum.length > 0 ? stockSum[0].totalValue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalStock,
        totalValue,
        lowStockCount
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while calculating stats',
      error: err.message
    });
  }
};
