const stripe = require('../config/stripe');

class PaymentService {
    async createPaymentIntent(amount) {
        if (!amount || amount <= 0) {
            throw new Error('Invalid amount');
        }

        // Stripe requires the amount to be an integer (in cents)
        const amountInCents = Math.round(amount);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return { clientSecret: paymentIntent.client_secret };
    }
}

module.exports = new PaymentService();
