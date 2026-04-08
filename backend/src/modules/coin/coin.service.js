const { getCoinWalletModel } = require('./coin.model');

const DAILY_REWARD = 100;
const REVIEW_REWARD = 500;

const getWallet = async (userId) => {
    const CoinWallet = getCoinWalletModel();
    let wallet = await CoinWallet.findOne({ userId });
    if (!wallet) {
        wallet = new CoinWallet({ userId });
        await wallet.save();
    }
    return wallet;
};

const getBalanceInfo = async (userId) => {
    const wallet = await getWallet(userId);
    let dailyClaimed = false;
    if (wallet.lastDailyClaim) {
        const last = new Date(wallet.lastDailyClaim);
        const now = new Date();
        if (last.toDateString() === now.toDateString()) {
            dailyClaimed = true;
        }
    }
    return { coins: wallet.balance, dailyClaimed };
};

const claimDaily = async (userId) => {
    const wallet = await getWallet(userId);

    if (wallet.lastDailyClaim) {
        const last = new Date(wallet.lastDailyClaim);
        const now = new Date();
        if (last.toDateString() === now.toDateString()) {
            throw new Error('Already claimed daily coins today.');
        }
    }

    wallet.balance += DAILY_REWARD;
    wallet.lastDailyClaim = new Date();
    wallet.transactions.push({
        type: 'EARN',
        amount: DAILY_REWARD,
        description: 'Daily Login Reward'
    });

    return await wallet.save();
};

const deductCoins = async (userId, amount, description) => {
    const wallet = await getWallet(userId);
    if (wallet.balance < amount) {
        throw new Error('Insufficient coins');
    }
    wallet.balance -= amount;
    wallet.transactions.push({
        type: 'SPEND',
        amount,
        description: description || 'Coin Deduction'
    });
    return await wallet.save();
};

const refundCoins = async (userId, amount, description) => {
    const wallet = await getWallet(userId);
    wallet.balance += amount;
    wallet.transactions.push({
        type: 'EARN',
        amount,
        description: description || 'Coin Refund'
    });
    return await wallet.save();
};

const earnReviewCoins = async (userId) => {
    const wallet = await getWallet(userId);
    wallet.balance += REVIEW_REWARD;
    wallet.transactions.push({
        type: 'EARN',
        amount: REVIEW_REWARD,
        description: 'Product Review Reward'
    });
    return await wallet.save();
};

module.exports = {
    getBalanceInfo,
    claimDaily,
    deductCoins,
    refundCoins,
    earnReviewCoins
};
