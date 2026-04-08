const express = require('express');
const router = express.Router();
const purchaseController = require('./purchase.controller');
const { authenticateToken } = require('../../middleware/authMiddleware');

router.get('/purchases', authenticateToken, purchaseController.getHistory);
router.get('/', purchaseController.healthCheck);

module.exports = router;
