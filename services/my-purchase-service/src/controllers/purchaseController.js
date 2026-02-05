class PurchaseController {
    async getHistory(req, res) {
        // Placeholder logic
        res.json({ message: 'Purchase history endpoint - to be implemented' });
    }

    async healthCheck(req, res) {
        res.json({ message: 'My Purchase Service is running' });
    }
}

module.exports = new PurchaseController();
