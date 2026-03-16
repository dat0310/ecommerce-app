const coinRepository = require('../repositories/coinRepository');

class CoinService {
    async getWallet(userId) {
        let wallet = await coinRepository.findByUserId(userId);
        if (!wallet) {
            wallet = await coinRepository.create({ userId });
        }
        return wallet;
    }

    async getBalanceInfo(userId) {
        const wallet = await this.getWallet(userId);
        let dailyClaimed = false;
        if (wallet.lastDailyClaim) {
            const last = new Date(wallet.lastDailyClaim);
            const now = new Date();
            if (last.toDateString() === now.toDateString()) {
                dailyClaimed = true;
            }
        }
        return {
            coins: wallet.balance,
            dailyClaimed
        };
    }

    async claimDaily(userId) {
        let wallet = await this.getWallet(userId);

        if (wallet.lastDailyClaim) {
            const last = new Date(wallet.lastDailyClaim);
            const now = new Date();
            if (last.toDateString() === now.toDateString()) {
                throw new Error('Already claimed daily coins today.');
            }
        }

        const DAILY_REWARD = 100;

        wallet.balance += DAILY_REWARD;
        wallet.lastDailyClaim = new Date();
        wallet.transactions.push({
            type: 'EARN',
            amount: DAILY_REWARD,
            description: 'Daily Login Reward'
        });

        return await coinRepository.save(wallet);
    }

    async deductCoins(userId, amount, description) {
        const wallet = await this.getWallet(userId);
        if (wallet.balance < amount) {
            throw new Error('Insufficient coins');
        }
        wallet.balance -= amount;
        wallet.transactions.push({
            type: 'SPEND',
            amount,
            description: description || 'Coin Deduction'
        });
        return await coinRepository.save(wallet);
    }

    async refundCoins(userId, amount, description) {
        const wallet = await this.getWallet(userId);
        wallet.balance += amount;
        wallet.transactions.push({
            type: 'EARN',
            amount,
            description: description || 'Coin Refund'
        });
        return await coinRepository.save(wallet);
    }

    async earnReviewReward(userId) {
        const REVIEW_REWARD = 500;
        const wallet = await this.getWallet(userId);
        wallet.balance += REVIEW_REWARD;
        wallet.transactions.push({
            type: 'EARN',
            amount: REVIEW_REWARD,
            description: 'Product Review Reward'
        });
        return await coinRepository.save(wallet);
    }
}

module.exports = new CoinService();
