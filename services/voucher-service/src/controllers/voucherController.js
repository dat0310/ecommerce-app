const voucherService = require('../services/voucherService');

class VoucherController {
    async getAllVouchers(req, res) {
        try {
            const vouchers = await voucherService.getAllVouchers();
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getActiveVouchers(req, res) {
        try {
            const vouchers = await voucherService.getActiveVouchers();
            const safeVouchers = vouchers.map(v => {
                const obj = v.toObject ? v.toObject() : v;
                return obj;
            });
            res.json(safeVouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMyVouchers(req, res) {
        try {
            const userId = req.user.id;
            const vouchers = await voucherService.getMyVouchers(userId);
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async acquireVoucher(req, res) {
        try {
            const userId = req.user.id;
            const voucherId = req.params.id;
            const authHeader = req.headers.authorization;
            const userVoucher = await voucherService.acquireVoucher(userId, voucherId, authHeader);
            res.status(200).json({ message: 'Voucher acquired successfully', data: userVoucher });
        } catch (error) {
            console.error('Error acquiring voucher:', error);
            res.status(400).json({ message: error.message });
        }
    }

    async createVoucher(req, res) {
        try {
            const voucher = await voucherService.createVoucher(req.body);
            res.status(201).json(voucher);
        } catch (error) {
            if (error.message === 'Voucher code already exists.') return res.status(400).json({ message: error.message });
            res.status(400).json({ message: error.message });
        }
    }

    async updateVoucher(req, res) {
        try {
            const voucher = await voucherService.updateVoucher(req.params.id, req.body);
            if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
            res.json(voucher);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteVoucher(req, res) {
        try {
            const voucher = await voucherService.deleteVoucher(req.params.id);
            if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
            res.json({ message: 'Voucher deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async applyVoucher(req, res) {
        try {
            const userId = req.user.id;
            const { code, orderTotal } = req.body;
            const voucher = await voucherService.applyVoucher(userId, code, orderTotal);
            res.json({
                message: 'Voucher applied successfully',
                voucher: {
                    code: voucher.code,
                    discountType: voucher.discountType,
                    discountValue: voucher.discountValue,
                    minOrderValue: voucher.minOrderValue,
                    maxDiscount: voucher.maxDiscount
                }
            });
        } catch (error) {
            if (error.message === 'Invalid voucher code.' || error.message === 'Voucher has expired.' || error.message.includes('limit') || error.message.includes('Order total')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message === 'Voucher code is required.') return res.status(400).json({ message: error.message });
            console.error('Error applying voucher:', error);
            res.status(500).json({ message: 'Failed to apply voucher.' });
        }
    }

    async redeemVoucher(req, res) {
        try {
            const userId = req.user.id;
            const voucher = await voucherService.redeemVoucher(userId, req.body.code);
            res.json({ message: 'Voucher redeemed successfully', usageCount: voucher.usageCount });
        } catch (error) {
            if (error.message === 'Voucher not found') return res.status(404).json({ message: error.message });
            res.status(500).json({ message: error.message });
        }
    }

    async refundVoucher(req, res) {
        try {
            const userId = req.user.id;
            const result = await voucherService.refundVoucher(userId, req.body.code);
            res.json(result);
        } catch (error) {
            console.error('Error refunding voucher:', error);
            res.status(400).json({ message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await voucherService.getStats();
            res.json(stats);
        } catch (error) {
            console.error('Error loading voucher stats:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new VoucherController();
