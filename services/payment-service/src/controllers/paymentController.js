const paymentService = require('../services/paymentService');

class PaymentController {
    async createIntent(req, res) {
        try {
            const { amount } = req.body;
            const result = await paymentService.createPaymentIntent(amount);
            res.json(result);
        } catch (error) {
            if (error.message === 'Invalid amount') {
                return res.status(400).json({ error: { message: error.message } });
            }
            console.error('Error creating payment intent:', error);
            res.status(500).json({ error: { message: 'Internal server error' } });
        }
    }

    async healthCheck(req, res) {
        res.json({ status: 'OK', message: 'Payment Service is running' });
    }
}

module.exports = new PaymentController();
