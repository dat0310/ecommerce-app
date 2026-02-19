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
            // Handle Stripe-specific errors
            if (error.type && error.type.startsWith('Stripe')) {
                console.error('Stripe error:', error.type, error.message);
                return res.status(error.statusCode || 500).json({
                    error: { message: error.message || 'Payment processing error' }
                });
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
