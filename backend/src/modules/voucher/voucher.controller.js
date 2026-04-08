const voucherService = require('./voucher.service');

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
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getMyVouchers(req, res) {
        try {
            const vouchers = await voucherService.getMyVouchers(req.user.id);
            res.json(vouchers);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async acquireVoucher(req, res) {
        try {
            const userVoucher = await voucherService.acquireVoucher(req.user.id, req.params.id);
            res.status(200).json({ message: 'Voucher acquired successfully', data: userVoucher });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async createVoucher(req, res) {
        try {
            const voucher = await voucherService.createVoucher(req.body);
            res.status(201).json(voucher);
        } catch (error) {
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
            const { code, orderTotal } = req.body;
            const voucher = await voucherService.applyVoucher(req.user.id, code, orderTotal);
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
            res.status(400).json({ message: error.message });
        }
    }

    async redeemVoucher(req, res) {
        try {
            const voucher = await voucherService.redeemVoucher(req.user.id, req.body.code);
            res.json({ message: 'Voucher redeemed successfully', usageCount: voucher.usageCount });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async refundVoucher(req, res) {
        try {
            const result = await voucherService.refundVoucher(req.user.id, req.body.code);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await voucherService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new VoucherController();
