const voucherRepository = require('../repositories/voucherRepository');
const userVoucherRepository = require('../repositories/userVoucherRepository');
const axios = require('axios');

const coinServiceUrl = process.env.COIN_SERVICE_URL || 'http://shophubcoin-service:3008';

class VoucherService {
    async getAllVouchers() {
        return await voucherRepository.findAll();
    }

    async getActiveVouchers() {
        const now = new Date();
        // Return active vouchers that have not expired and still have usage limit capacity
        return await voucherRepository.findAll({
            isActive: true,
            expiryDate: { $gt: now },
            $or: [
                { usageLimit: null },
                { $expr: { $lt: ["$usageCount", "$usageLimit"] } }
            ]
        });
    }

    async getMyVouchers(userId) {
        // Fetch all active system vouchers to show what's available
        const activeSystemVouchers = await this.getActiveVouchers();
        // Fetch user's vouchers
        const userVouchers = await userVoucherRepository.findByUser(userId);

        // Map system vouchers with user status
        return activeSystemVouchers.map(v => {
            const vObj = v.toObject ? v.toObject() : v;
            const userVoucher = userVouchers.find(uv => uv.voucherId.toString() === v._id.toString());

            if (userVoucher) {
                if (userVoucher.status === 'EXPIRED') {
                    return null; // Don't show expired bought vouchers
                }
                vObj.userStatus = userVoucher.status; // 'AVAILABLE', 'USED'
            } else {
                vObj.userStatus = 'NOT_ACQUIRED';
            }
            return vObj;
        }).filter(v => v !== null); // Remove nulls (expired)
    }

    async acquireVoucher(userId, voucherId, authHeader) {
        const voucher = await voucherRepository.findById(voucherId);
        if (!voucher || !voucher.isActive) throw new Error('Voucher is not available.');

        if (new Date() > voucher.expiryDate) {
            throw new Error('Voucher has expired.');
        }

        if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
            throw new Error('Voucher usage limit reached.');
        }

        const existing = await userVoucherRepository.findByUserAndVoucher(userId, voucherId);
        if (existing) {
            throw new Error('You have already acquired this voucher.');
        }

        // Check fee and deduct coins
        if (voucher.fee > 0) {
            try {
                await axios.post(`${coinServiceUrl}/deduct`, {
                    userId,
                    amount: voucher.fee,
                    description: `Bought voucher ${voucher.code}`
                }, { headers: { 'Authorization': authHeader } });
            } catch (error) {
                console.error('Failed to deduct coins for voucher:', error.response?.data || error.message);
                throw new Error(error.response?.data?.message || 'Failed to deduct coins. Insufficient balance?');
            }
        }

        // Create user voucher
        return await userVoucherRepository.create({
            userId,
            voucherId: voucher._id,
            status: 'AVAILABLE'
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

    async applyVoucher(userId, code, orderTotal) {
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

        // Verify user has acquired and not used it
        const userVoucher = await userVoucherRepository.findByUserAndVoucher(userId, voucher._id);
        if (!userVoucher || userVoucher.status !== 'AVAILABLE') {
            throw new Error('You have not acquired this voucher or it has already been used.');
        }

        return voucher;
    }

    async redeemVoucher(userId, code) {
        const voucher = await voucherRepository.findByCode(code.toUpperCase());
        if (!voucher) throw new Error('Voucher not found');

        const userVoucher = await userVoucherRepository.findByUserAndVoucher(userId, voucher._id);
        if (!userVoucher || userVoucher.status !== 'AVAILABLE') {
            throw new Error('Voucher is not available for redemption.');
        }

        // Mark as used
        await userVoucherRepository.updateStatus(userId, voucher._id, 'USED');

        voucher.usageCount += 1;
        return await voucherRepository.save(voucher);
    }

    async refundVoucher(userId, code) {
        const voucher = await voucherRepository.findByCode(code.toUpperCase());
        if (!voucher) throw new Error('Voucher not found');

        const userVoucher = await userVoucherRepository.findByUserAndVoucher(userId, voucher._id);
        if (!userVoucher || userVoucher.status !== 'USED') {
            throw new Error('Voucher was not used.');
        }

        // Unmark as used
        await userVoucherRepository.updateStatus(userId, voucher._id, 'AVAILABLE');

        if (voucher.usageCount > 0) {
            voucher.usageCount -= 1;
            await voucherRepository.save(voucher);
        }
        return { message: 'Voucher refunded' };
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
