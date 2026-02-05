const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/health', cartController.healthCheck); // Health check doesn't need auth, but it is not under /api/cart usually.
// Wait, in server.js, health was /health. Here routes are mounted under /api/cart?
// If so, app.js should separate them.

router.get('/', authenticateToken, cartController.getCart);
router.put('/', authenticateToken, cartController.replaceCart);
router.post('/items', authenticateToken, cartController.addItem);
router.patch('/items/:productId', authenticateToken, cartController.updateItem);
router.delete('/items/:productId', authenticateToken, cartController.removeItem);
router.delete('/', authenticateToken, cartController.clearCart);

module.exports = router;
