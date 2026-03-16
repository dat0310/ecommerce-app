const UserVoucher = require('../models/UserVoucher');

class UserVoucherRepository {
    async create(data) {
        const userVoucher = new UserVoucher(data);
        return await userVoucher.save();
    }

    async findByUserAndVoucher(userId, voucherId) {
        return await UserVoucher.findOne({ userId, voucherId });
    }

    async findByUser(userId) {
        return await UserVoucher.find({ userId });
    }

    async updateStatus(userId, voucherId, status) {
        return await UserVoucher.findOneAndUpdate(
            { userId, voucherId },
            { status, ...(status === 'USED' ? { usedAt: Date.now() } : {}) },
            { new: true }
        );
    }
}

module.exports = new UserVoucherRepository();
