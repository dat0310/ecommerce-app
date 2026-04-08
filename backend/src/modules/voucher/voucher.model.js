const mongoose = require('mongoose');
const { getConnection } = require('../../config/database');

const voucherSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, default: '' },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null },
    usageLimit: { type: Number, default: null },
    usageCount: { type: Number, default: 0 },
    fee: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

const userVoucherSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', required: true },
    status: { type: String, enum: ['AVAILABLE', 'USED', 'EXPIRED'], default: 'AVAILABLE' },
    acquiredAt: { type: Date, default: Date.now },
    usedAt: { type: Date, default: null }
});

userVoucherSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

let Voucher, UserVoucher;

const getVoucherModel = () => {
    if (!Voucher) {
        const conn = getConnection('voucher');
        Voucher = conn.model('Voucher', voucherSchema);
    }
    return Voucher;
};

const getUserVoucherModel = () => {
    if (!UserVoucher) {
        const conn = getConnection('voucher');
        UserVoucher = conn.model('UserVoucher', userVoucherSchema);
    }
    return UserVoucher;
};

module.exports = { getVoucherModel, getUserVoucherModel, voucherSchema, userVoucherSchema };
