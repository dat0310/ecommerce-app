const mongoose = require('mongoose');
const { getConnection } = require('../../config/database');

const coinSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    lastDailyClaim: { type: Date, default: null },
    transactions: [
        {
            type: { type: String, enum: ['EARN', 'SPEND'] },
            amount: Number,
            description: String,
            date: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

let CoinWallet;

const getCoinWalletModel = () => {
    if (!CoinWallet) {
        const conn = getConnection('coin');
        CoinWallet = conn.model('CoinWallet', coinSchema);
    }
    return CoinWallet;
};

module.exports = { getCoinWalletModel, coinSchema };
