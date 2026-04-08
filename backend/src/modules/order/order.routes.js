const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/health', orderController.healthCheck);
router.get('/stats', authenticateToken, requireRole(['admin']), orderController.getStats);
router.get('/seller/my-orders', authenticateToken, requireRole(['seller']), orderController.getSellerOrders);
router.get('/status/:status', authenticateToken, requireRole(['admin']), orderController.getOrdersByStatus);
router.get('/user/:userId', authenticateToken, orderController.getUserOrders);
router.get('/check-purchase', authenticateToken, orderController.checkPurchase);
router.get('/', authenticateToken, requireRole(['admin']), orderController.getAllOrders);
router.post('/', authenticateToken, orderController.createOrder);
router.get('/:id', authenticateToken, orderController.getOrderById);
router.put('/:id', authenticateToken, requireRole(['admin']), orderController.updateOrder);
router.delete('/:id', authenticateToken, requireRole(['admin']), orderController.deleteOrder);
router.patch('/:id/accept', authenticateToken, requireRole(['seller']), orderController.acceptOrder);
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);
router.patch('/:id/request-refund', authenticateToken, orderController.requestRefund);
router.patch('/:id/confirm-received', authenticateToken, orderController.confirmReceived);
router.patch('/:id/approve-refund', authenticateToken, requireRole(['seller']), orderController.approveRefund);
router.patch('/:id/reject-refund', authenticateToken, requireRole(['seller']), orderController.rejectRefund);
router.patch('/:id/open-dispute', authenticateToken, orderController.openDispute);
router.patch('/:id/resolve-dispute', authenticateToken, requireRole(['admin']), orderController.resolveDispute);
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'seller']), orderController.updateStatus);
router.patch('/:id/payment-status', authenticateToken, requireRole(['admin']), orderController.updatePaymentStatus);

module.exports = router;
