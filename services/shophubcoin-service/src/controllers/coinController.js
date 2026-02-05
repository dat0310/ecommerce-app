const coinService = require('../services/coinService');

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
}

module.exports = new CoinController();
