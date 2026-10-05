const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suppliers',
      error: err.message
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Supplier ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching supplier',
      error: err.message
    });
  }
};

// @desc    Create new supplier
// @route   POST /api/suppliers
exports.createSupplier = async (req, res) => {
  try {
    const { supplierName, companyName, email, phone, address } = req.body;

    if (!supplierName || !companyName || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide supplierName, companyName, email, and phone'
      });
    }

    const supplier = await Supplier.create({
      supplierName,
      companyName,
      email,
      phone,
      address
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating supplier',
      error: err.message
    });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
exports.updateSupplier = async (req, res) => {
  try {
    const { supplierName, companyName, email, phone, address } = req.body;

    let supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { supplierName, companyName, email, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Supplier ID format'
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
      message: 'Server error while updating supplier',
      error: err.message
    });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    await Supplier.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
      data: {}
    });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid Supplier ID format'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting supplier',
      error: err.message
    });
  }
};
