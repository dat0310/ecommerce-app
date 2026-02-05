const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coinController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, coinController.getBalance);
router.post('/claim-daily', authenticateToken, coinController.claimDaily);

module.exports = router;
