const express = require('express');
const router = express.Router();
const {
  getProducts,
  getLowStockProducts,
  getStats,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

// Stats endpoint
router.get('/stats', getStats);

// Low-stock endpoint
router.get('/low-stock', getLowStockProducts);

// Standard CRUD endpoints
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
