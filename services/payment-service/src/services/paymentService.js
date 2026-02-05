const stripe = require('../config/stripe');

class PaymentService {
    async createPaymentIntent(amount) {
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return { clientSecret: paymentIntent.client_secret };
    }
}

module.exports = new PaymentService();
