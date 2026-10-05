const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Supplier = require('./models/Supplier');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/inventory_db';

const sampleSuppliers = [
  {
    supplierName: 'ABC Electronics Ltd',
    companyName: 'ABC Corp',
    email: 'contact@abccorp.com',
    phone: '+91 98765 43210',
    address: 'Plot 45, Okhla Industrial Area, New Delhi'
  },
  {
    supplierName: 'Tech World Distribution',
    companyName: 'Tech World Solutions Pvt Ltd',
    email: 'sales@techworld.com',
    phone: '+91 98123 45678',
    address: '2nd Floor, Electronic City, Bengaluru'
  },
  {
    supplierName: 'Global Components',
    companyName: 'Global Components International',
    email: 'support@globalcomponents.org',
    phone: '+91 91234 56789',
    address: 'B-12, Sector 62, Noida'
  }
];

const sampleProducts = [
  {
    productName: 'Wireless Mouse',
    productCode: 'WM001',
    category: 'Electronics',
    supplier: 'ABC Corp',
    quantity: 45,
    price: 599,
    reorderLevel: 10,
    description: '2.4GHz optical wireless mouse with ergonomic design'
  },
  {
    productName: 'Mechanical Keyboard',
    productCode: 'KB002',
    category: 'Electronics',
    supplier: 'Tech World Solutions Pvt Ltd',
    quantity: 12,
    price: 2499,
    reorderLevel: 15,
    description: 'RGB Backlit mechanical keyboard with blue switches'
  },
  {
    productName: 'USB-C Cable (Braided)',
    productCode: 'CB003',
    category: 'Accessories',
    supplier: 'Global Components International',
    quantity: 8,
    price: 299,
    reorderLevel: 20,
    description: 'Fast charging 60W nylon braided 1.5m cable'
  },
  {
    productName: 'Aluminum Laptop Stand',
    productCode: 'LS004',
    category: 'Accessories',
    supplier: 'ABC Corp',
    quantity: 25,
    price: 1299,
    reorderLevel: 5,
    description: 'Foldable aluminum ergonomic laptop elevator'
  },
  {
    productName: 'HDMI 2.1 Cable (2m)',
    productCode: 'HD005',
    category: 'Cables',
    supplier: 'Global Components International',
    quantity: 4,
    price: 499,
    reorderLevel: 10,
    description: 'Ultra high speed 8K @ 60Hz HDMI cable'
  }
];

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected! Clearing existing products and suppliers...');

    await Product.deleteMany({});
    await Supplier.deleteMany({});

    console.log('Inserting sample suppliers...');
    await Supplier.insertMany(sampleSuppliers);

    console.log('Inserting sample products...');
    await Product.insertMany(sampleProducts);

    console.log('\n Sample data seeded successfully!');
    console.log(`- ${sampleSuppliers.length} Suppliers added`);
    console.log(`- ${sampleProducts.length} Products added (including low-stock products)`);
    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
}

seedData();
