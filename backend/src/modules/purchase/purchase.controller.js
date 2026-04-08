const purchaseService = require('./purchase.service');

class PurchaseController {
    async getHistory(req, res) {
        try {
            const purchases = await purchaseService.getPurchaseHistory(req.user.id);
            res.json(purchases);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async healthCheck(req, res) {
        res.json({ status: 'OK', service: 'purchase-service' });
    }
}

module.exports = new PurchaseController();
