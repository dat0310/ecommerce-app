const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema({
    userId: {
        type: String, // String to match how userId is stored in other models (usually from Firebase Auth or a String ID)
        required: true,
        index: true
    },
    voucherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voucher',
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'USED', 'EXPIRED'],
        default: 'AVAILABLE'
    },
    acquiredAt: {
        type: Date,
        default: Date.now
    },
    usedAt: {
        type: Date,
        default: null
    }
});

// Ensure a user can only acquire a specific voucher once
userVoucherSchema.index({ userId: 1, voucherId: 1 }, { unique: true });

const UserVoucher = mongoose.model('UserVoucher', userVoucherSchema);
module.exports = UserVoucher;
