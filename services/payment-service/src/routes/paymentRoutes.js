const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-intent', paymentController.createIntent);
router.post('/refund', paymentController.refund);

module.exports = router;
