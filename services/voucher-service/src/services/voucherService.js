const voucherRepository = require('../repositories/voucherRepository');

class VoucherService {
    async getAllVouchers() {
        return await voucherRepository.findAll();
    }

    async getActiveVouchers() {
        const now = new Date();
        // Complex queries might need to stay in Repo or be constructed here. 
        // Since repo.findAll accepts query, we pass it here.
        return await voucherRepository.findAll({
            isActive: true,
            expiryDate: { $gt: now },
            $expr: {
                $or: [
                    { $eq: ["$usageLimit", null] },
                    { $lt: ["$usageCount", "$usageLimit"] }
                ]
            }
        });
    }

    async createVoucher(voucherData) {
        const existingVoucher = await voucherRepository.findByCode(voucherData.code.toUpperCase());
        if (existingVoucher) {
            throw new Error('Voucher code already exists.');
        }

        const newVoucherData = {
            ...voucherData,
            code: voucherData.code.toUpperCase()
        };

        return await voucherRepository.create(newVoucherData);
    }

    async updateVoucher(id, updateData) {
        return await voucherRepository.updateById(id, updateData);
    }

    async deleteVoucher(id) {
        return await voucherRepository.deleteById(id);
    }

    async applyVoucher(code, orderTotal) {
        if (!code) throw new Error('Voucher code is required.');

        const voucher = await voucherRepository.findByCode(code.toUpperCase());

        if (!voucher || !voucher.isActive) {
            throw new Error('Invalid voucher code.');
        }

        if (new Date() > voucher.expiryDate) {
            throw new Error('Voucher has expired.');
        }

        if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
            throw new Error('Voucher usage limit reached.');
        }

        if (orderTotal !== undefined && orderTotal < voucher.minOrderValue) {
            throw new Error(`Order total must be at least $${voucher.minOrderValue} to use this voucher.`);
        }

        return voucher;
    }

    async redeemVoucher(code) {
        const voucher = await voucherRepository.findByCode(code.toUpperCase());
        if (!voucher) throw new Error('Voucher not found');

        voucher.usageCount += 1;
        return await voucherRepository.save(voucher);
    }

    async getStats() {
        const totalVouchers = await voucherRepository.countDocuments();
        const activeVouchers = await voucherRepository.countDocuments({ isActive: true });
        const expiredVouchers = await voucherRepository.countDocuments({ expiryDate: { $lt: new Date() } });

        return {
            totalVouchers,
            activeVouchers,
            expiredVouchers
        };
    }
}

module.exports = new VoucherService();
