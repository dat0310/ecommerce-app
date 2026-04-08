const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

// Payment routes require authentication
router.post('/create-intent', authenticateToken, paymentController.createIntent);
router.post('/refund', authenticateToken, paymentController.refund);

// Health check doesn't require auth
router.get('/health', paymentController.healthCheck);

module.exports = router;
