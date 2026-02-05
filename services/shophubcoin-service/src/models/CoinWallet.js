const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    lastDailyClaim: {
        type: Date,
        default: null
    },
    transactions: [
        {
            type: { type: String, enum: ['EARN', 'SPEND'] },
            amount: Number,
            description: String,
            date: { type: Date, default: Date.now }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const CoinWallet = mongoose.model('CoinWallet', coinSchema);
module.exports = CoinWallet;
