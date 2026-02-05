const coinRepository = require('../repositories/coinRepository');

class CoinService {
    async getWallet(userId) {
        let wallet = await coinRepository.findByUserId(userId);
        if (!wallet) {
            // Logic says if not found, create new.
            // This implicitly means any authenticated user has a wallet.
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
}

module.exports = new CoinService();
