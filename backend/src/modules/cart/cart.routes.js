const express = require('express');
const router = express.Router();
const cartController = require('./cart.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.get('/health', cartController.healthCheck);
router.get('/', authenticateToken, cartController.getCart);
router.put('/', authenticateToken, cartController.replaceCart);
router.post('/items', authenticateToken, cartController.addItem);
router.patch('/items/:productId', authenticateToken, cartController.updateItem);
router.delete('/items/:productId', authenticateToken, cartController.removeItem);
router.delete('/', authenticateToken, cartController.clearCart);

module.exports = router;
