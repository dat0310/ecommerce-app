const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// 1. Health check (No auth required)
router.get('/health', orderController.healthCheck);

// 2. Specific GET Routes (MUST come before /:id)

// Get orders statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), orderController.getStats);

// Get seller's orders
router.get('/seller/my-orders', authenticateToken, requireRole(['seller']), orderController.getSellerOrders);

// Get orders by status (admin only)
router.get('/status/:status', authenticateToken, requireRole(['admin']), orderController.getOrdersByStatus);

// Get orders by user ID (admin or user themselves)
router.get('/user/:userId', authenticateToken, orderController.getUserOrders); // Note: Route handler handles permission check for userId

// Check if user has purchased and received a product (for review eligibility)
router.get('/check-purchase', authenticateToken, orderController.checkPurchase);

// 3. General Collection Routes

// Get all orders (admin only)
router.get('/', authenticateToken, requireRole(['admin']), orderController.getAllOrders);

// Create a new order (authenticated users)
router.post('/', authenticateToken, orderController.createOrder);

// 4. Parameterized Routes (/:id) - MUST be last for GET

// Get order by ID (admin, seller, or order owner)
router.get('/:id', authenticateToken, orderController.getOrderById);

// Update an order (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), orderController.updateOrder);

// Delete an order (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), orderController.deleteOrder);

// Accept an order (seller only)
router.patch('/:id/accept', authenticateToken, requireRole(['seller']), orderController.acceptOrder);

// Buyer cancels own order (pending/confirmed/processing)
router.patch('/:id/cancel', authenticateToken, orderController.cancelOrder);

// Buyer requests refund (delivered only)
router.patch('/:id/request-refund', authenticateToken, orderController.requestRefund);

// Buyer confirms received (shipped → delivered)
router.patch('/:id/confirm-received', authenticateToken, orderController.confirmReceived);

// Seller approves refund
router.patch('/:id/approve-refund', authenticateToken, requireRole(['seller']), orderController.approveRefund);

// Seller rejects refund
router.patch('/:id/reject-refund', authenticateToken, requireRole(['seller']), orderController.rejectRefund);

// Buyer opens dispute (after seller rejects refund)
router.patch('/:id/open-dispute', authenticateToken, orderController.openDispute);

// Admin resolves dispute
router.patch('/:id/resolve-dispute', authenticateToken, requireRole(['admin']), orderController.resolveDispute);

// Update order status (seller or admin)
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'seller']), orderController.updateStatus);

// Update payment status (admin only)
router.patch('/:id/payment-status', authenticateToken, requireRole(['admin']), orderController.updatePaymentStatus);

module.exports = router;
