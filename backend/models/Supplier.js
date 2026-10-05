const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    required: [true, 'Supplier name is required'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    trim: true,
    default: 'N/A'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);
