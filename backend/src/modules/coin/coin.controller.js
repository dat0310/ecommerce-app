const coinService = require('./coin.service');

class CoinController {
    async getBalance(req, res) {
        try {
            const info = await coinService.getBalanceInfo(req.user.id);
            res.json(info);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async claimDaily(req, res) {
        try {
            const wallet = await coinService.claimDaily(req.user.id);
            res.json({
                message: 'Daily coins claimed successfully!',
                coins: wallet.balance,
                dailyClaimed: true
            });
        } catch (error) {
            if (error.message === 'Already claimed daily coins today.') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async deductCoins(req, res) {
        try {
            const { userId, amount, description } = req.body;
            if (!userId || !amount) {
                return res.status(400).json({ message: 'userId and amount are required' });
            }
            const wallet = await coinService.deductCoins(userId, amount, description);
            res.json({ message: 'Coins deducted', coins: wallet.balance });
        } catch (error) {
            if (error.message === 'Insufficient coins') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async refundCoins(req, res) {
        try {
            const { userId, amount, description } = req.body;
            if (!userId || !amount) {
                return res.status(400).json({ message: 'userId and amount are required' });
            }
            const wallet = await coinService.refundCoins(userId, amount, description);
            res.json({ message: 'Coins refunded', coins: wallet.balance });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async earnReviewReward(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).json({ message: 'userId is required' });
            }
            const wallet = await coinService.earnReviewCoins(userId);
            res.json({ message: 'Review reward earned! +500 coins', coins: wallet.balance });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new CoinController();
