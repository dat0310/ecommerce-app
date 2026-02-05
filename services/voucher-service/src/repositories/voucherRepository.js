const Voucher = require('../models/Voucher');

class VoucherRepository {
    async findAll(query = {}, sort = { createdAt: -1 }) {
        return await Voucher.find(query).sort(sort);
    }

    async findByCode(code) {
        return await Voucher.findOne({ code });
    }

    async findById(id) {
        return await Voucher.findById(id);
    }

    async create(voucherData) {
        const voucher = new Voucher(voucherData);
        return await voucher.save();
    }

    async updateById(id, updateData) {
        return await Voucher.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deleteById(id) {
        return await Voucher.findByIdAndDelete(id);
    }

    async countDocuments(query = {}) {
        return await Voucher.countDocuments(query);
    }

    async save(voucher) {
        return await voucher.save();
    }
}

module.exports = new VoucherRepository();
