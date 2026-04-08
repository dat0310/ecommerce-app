const express = require('express');
const router = express.Router();
const voucherController = require('./voucher.controller');
const { authenticateToken, requireRole } = require('../../middleware/authMiddleware');

router.get('/active', voucherController.getActiveVouchers);
router.get('/my-vouchers', authenticateToken, voucherController.getMyVouchers);
router.post('/:id/acquire', authenticateToken, voucherController.acquireVoucher);
router.post('/apply', authenticateToken, voucherController.applyVoucher);
router.post('/redeem', authenticateToken, voucherController.redeemVoucher);
router.post('/refund', authenticateToken, voucherController.refundVoucher);

// Admin Routes
router.get('/', authenticateToken, requireRole(['admin']), voucherController.getAllVouchers);
router.post('/', authenticateToken, requireRole(['admin']), voucherController.createVoucher);
router.patch('/:id', authenticateToken, requireRole(['admin']), voucherController.updateVoucher);
router.delete('/:id', authenticateToken, requireRole(['admin']), voucherController.deleteVoucher);
router.get('/stats', authenticateToken, requireRole(['admin']), voucherController.getStats);

module.exports = router;
