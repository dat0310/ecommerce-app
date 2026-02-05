const CoinWallet = require('../models/CoinWallet');

class CoinRepository {
    async findByUserId(userId) {
        return await CoinWallet.findOne({ userId });
    }

    async create(walletData) {
        const wallet = new CoinWallet(walletData);
        return await wallet.save();
    }

    async save(wallet) {
        return await wallet.save();
    }
}

module.exports = new CoinRepository();
