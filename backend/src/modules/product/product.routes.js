const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const { authenticateToken, optionalAuth, requireRole } = require('../../middleware/authMiddleware');
const upload = require('./upload.middleware');

// Public Routes
router.get('/', productController.getApprovedProducts);
router.get('/seller/:sellerId/public', productController.getShopProducts);

// Seller Routes
router.get('/seller/my-products', authenticateToken, requireRole(['seller']), productController.getSellerProducts);
router.post('/', authenticateToken, requireRole(['seller']), upload.any(), productController.createProduct);

// Admin Routes
router.get('/pending', authenticateToken, requireRole(['admin']), productController.getPendingProducts);
router.get('/admin/all', authenticateToken, requireRole(['admin']), productController.getAllProducts);
router.patch('/:id/status', authenticateToken, requireRole(['admin']), productController.updateProductStatus);

// Review Routes (must come before /:id to avoid route conflicts)
router.get('/reviews/my', authenticateToken, productController.getMyReviews);
router.get('/:id/reviews', productController.getProductReviews);
router.post('/:id/reviews', authenticateToken, productController.createReview);
router.delete('/:id/reviews', authenticateToken, productController.deleteReview);

// Product by ID (optional auth for role checking)
router.get('/:id', optionalAuth, productController.getProductById);

// Update/Delete Product
router.patch('/:id', authenticateToken, upload.any(), productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

// Stock management (internal)
router.patch('/:id/reduce-stock', authenticateToken, productController.reduceStock);
router.patch('/:id/restore-stock', authenticateToken, productController.restoreStock);

module.exports = router;
