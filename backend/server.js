const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Inventory Management System API is running smoothly',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);

// Fallback 404 for unknown API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.originalUrl} not found`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Port & MongoDB configuration
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_db';

async function initDatabase() {
  try {
    // Attempt connecting to configured URI
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    console.log('==================================================');
    console.log(' MongoDB Connected Successfully!');
    console.log(` Database: ${mongoose.connection.name}`);
    console.log('==================================================');
  } catch (err) {
    console.log('⚠️ Could not connect to primary MongoDB URI.');
    console.log('🔄 Starting built-in MongoDB server (mongodb-memory-server)...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log('==================================================');
      console.log(' Built-in MongoDB Connected Successfully!');
      console.log(` In-Memory Database URI: ${memoryUri}`);
      console.log('==================================================');

      // Auto-populate initial sample data if empty
      const Product = require('./models/Product');
      const Supplier = require('./models/Supplier');
      const count = await Product.countDocuments();
      if (count === 0) {
        console.log('📦 Auto-seeding initial inventory sample data...');
        const sampleSuppliers = [
          { supplierName: 'ABC Electronics Ltd', companyName: 'ABC Corp', email: 'contact@abccorp.com', phone: '+91 98765 43210', address: 'Plot 45, Okhla Industrial Area, New Delhi' },
          { supplierName: 'Tech World Distribution', companyName: 'Tech World Solutions Pvt Ltd', email: 'sales@techworld.com', phone: '+91 98123 45678', address: '2nd Floor, Electronic City, Bengaluru' },
          { supplierName: 'Global Components', companyName: 'Global Components International', email: 'support@globalcomponents.org', phone: '+91 91234 56789', address: 'B-12, Sector 62, Noida' }
        ];
        await Supplier.insertMany(sampleSuppliers);
        const sampleProducts = [
          { productName: 'Wireless Mouse', productCode: 'WM001', category: 'Electronics', supplier: 'ABC Corp', quantity: 45, price: 599, reorderLevel: 10, description: '2.4GHz optical wireless mouse with ergonomic design' },
          { productName: 'Mechanical Keyboard', productCode: 'KB002', category: 'Electronics', supplier: 'Tech World Solutions Pvt Ltd', quantity: 12, price: 2499, reorderLevel: 15, description: 'RGB Backlit mechanical keyboard with blue switches' },
          { productName: 'USB-C Cable (Braided)', productCode: 'CB003', category: 'Accessories', supplier: 'Global Components International', quantity: 8, price: 299, reorderLevel: 20, description: 'Fast charging 60W nylon braided 1.5m cable' },
          { productName: 'Aluminum Laptop Stand', productCode: 'LS004', category: 'Accessories', supplier: 'ABC Corp', quantity: 25, price: 1299, reorderLevel: 5, description: 'Foldable aluminum ergonomic laptop elevator' },
          { productName: 'HDMI 2.1 Cable (2m)', productCode: 'HD005', category: 'Cables', supplier: 'Global Components International', quantity: 4, price: 499, reorderLevel: 10, description: 'Ultra high speed 8K @ 60Hz HDMI cable' }
        ];
        await Product.insertMany(sampleProducts);
        console.log(' Sample data seeded into database!');
      }
    } catch (fallbackErr) {
      console.error('❌ Failed to start fallback database:', fallbackErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log('==================================================');
    console.log(` Server running on http://localhost:${PORT}`);
    console.log(` Frontend accessible at http://localhost:${PORT}`);
    console.log(` API base: http://localhost:${PORT}/api/products`);
    console.log('==================================================');
  });
}

initDatabase();
