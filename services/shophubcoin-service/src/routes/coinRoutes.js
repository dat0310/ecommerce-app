const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coinController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, coinController.getBalance);
router.post('/claim-daily', authenticateToken, coinController.claimDaily);

// Inter-service endpoints (called by order-service, product-service)
router.post('/deduct', authenticateToken, coinController.deductCoins);
router.post('/refund', authenticateToken, coinController.refundCoins);
router.post('/earn-review', authenticateToken, coinController.earnReviewReward);

module.exports = router;
