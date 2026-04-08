const { getVoucherModel, getUserVoucherModel } = require('./voucher.model');
const { deductCoins } = require('../coin/coin.service');

const getAllVouchers = async () => {
    const Voucher = getVoucherModel();
    return await Voucher.find({}).sort({ createdAt: -1 });
};

const getActiveVouchers = async () => {
    const Voucher = getVoucherModel();
    const now = new Date();
    return await Voucher.find({
        isActive: true,
        expiryDate: { $gt: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
    }).sort({ createdAt: -1 });
};

const getMyVouchers = async (userId) => {
    const UserVoucher = getUserVoucherModel();
    const activeSystemVouchers = await getActiveVouchers();
    const userVouchers = await UserVoucher.find({ userId });

    return activeSystemVouchers.map(v => {
        const vObj = v.toObject ? v.toObject() : v;
        const userVoucher = userVouchers.find(uv => uv.voucherId.toString() === v._id.toString());

        if (userVoucher) {
            if (userVoucher.status === 'EXPIRED') return null;
            vObj.userStatus = userVoucher.status;
        } else {
            vObj.userStatus = 'NOT_ACQUIRED';
        }
        return vObj;
    }).filter(v => v !== null);
};

const acquireVoucher = async (userId, voucherId) => {
    const Voucher = getVoucherModel();
    const UserVoucher = getUserVoucherModel();

    const voucher = await Voucher.findById(voucherId);
    if (!voucher || !voucher.isActive) throw new Error('Voucher is not available.');
    if (new Date() > voucher.expiryDate) throw new Error('Voucher has expired.');
    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
        throw new Error('Voucher usage limit reached.');
    }

    const existing = await UserVoucher.findOne({ userId, voucherId });
    if (existing) throw new Error('You have already acquired this voucher.');

    if (voucher.fee > 0) {
        await deductCoins(userId, voucher.fee, `Bought voucher ${voucher.code}`);
    }

    const userVoucher = new UserVoucher({
        userId,
        voucherId: voucher._id,
        status: 'AVAILABLE'
    });
    return await userVoucher.save();
};

const createVoucher = async (voucherData) => {
    const Voucher = getVoucherModel();
    const existingVoucher = await Voucher.findOne({ code: voucherData.code.toUpperCase() });
    if (existingVoucher) throw new Error('Voucher code already exists.');

    const voucher = new Voucher({
        ...voucherData,
        code: voucherData.code.toUpperCase()
    });
    return await voucher.save();
};

const updateVoucher = async (id, updateData) => {
    const Voucher = getVoucherModel();
    return await Voucher.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteVoucher = async (id) => {
    const Voucher = getVoucherModel();
    return await Voucher.findByIdAndDelete(id);
};

const applyVoucher = async (userId, code, orderTotal) => {
    const Voucher = getVoucherModel();
    const UserVoucher = getUserVoucherModel();

    if (!code) throw new Error('Voucher code is required.');

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher || !voucher.isActive) throw new Error('Invalid voucher code.');
    if (new Date() > voucher.expiryDate) throw new Error('Voucher has expired.');
    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
        throw new Error('Voucher usage limit reached.');
    }
    if (orderTotal !== undefined && orderTotal < voucher.minOrderValue) {
        throw new Error(`Order total must be at least $${voucher.minOrderValue} to use this voucher.`);
    }

    const userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id });
    if (!userVoucher || userVoucher.status !== 'AVAILABLE') {
        throw new Error('You have not acquired this voucher or it has already been used.');
    }

    return voucher;
};

const redeemVoucher = async (userId, code) => {
    const Voucher = getVoucherModel();
    const UserVoucher = getUserVoucherModel();

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) throw new Error('Voucher not found');

    const userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id });
    if (!userVoucher || userVoucher.status !== 'AVAILABLE') {
        throw new Error('Voucher is not available for redemption.');
    }

    userVoucher.status = 'USED';
    userVoucher.usedAt = new Date();
    await userVoucher.save();

    voucher.usageCount += 1;
    return await voucher.save();
};

const refundVoucher = async (userId, code) => {
    const Voucher = getVoucherModel();
    const UserVoucher = getUserVoucherModel();

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) throw new Error('Voucher not found');

    const userVoucher = await UserVoucher.findOne({ userId, voucherId: voucher._id });
    if (!userVoucher || userVoucher.status !== 'USED') {
        throw new Error('Voucher was not used.');
    }

    userVoucher.status = 'AVAILABLE';
    userVoucher.usedAt = null;
    await userVoucher.save();

    if (voucher.usageCount > 0) {
        voucher.usageCount -= 1;
        await voucher.save();
    }
    return { message: 'Voucher refunded' };
};

const getStats = async () => {
    const Voucher = getVoucherModel();
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ isActive: true });
    const expiredVouchers = await Voucher.countDocuments({ expiryDate: { $lt: new Date() } });

    return { totalVouchers, activeVouchers, expiredVouchers };
};

module.exports = {
    getAllVouchers,
    getActiveVouchers,
    getMyVouchers,
    acquireVoucher,
    createVoucher,
    updateVoucher,
    deleteVoucher,
    applyVoucher,
    redeemVoucher,
    refundVoucher,
    getStats
};
