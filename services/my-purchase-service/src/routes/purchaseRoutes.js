const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');

router.get('/purchases', purchaseController.getHistory);
router.get('/', purchaseController.healthCheck); // Root checks health or use specific health endpoint? Original had root as health.

module.exports = router;
