const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount) => {
    if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
    }

    const amountInCents = Math.round(amount);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: {
            enabled: true,
        },
    });

    return { clientSecret: paymentIntent.client_secret };
};

const processRefund = async (paymentIntentId) => {
    if (!paymentIntentId) {
        throw new Error('Payment Intent ID is required for refund');
    }

    console.log('[Stripe] Processing refund for payment:', paymentIntentId);

    // First, check the payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
        console.log('[Stripe] Payment not succeeded, skipping refund. Status:', paymentIntent.status);
        return { skipped: true, reason: `Payment status is ${paymentIntent.status}` };
    }

    // Check if already refunded
    if (paymentIntent.amount_received === 0) {
        console.log('[Stripe] Payment already fully refunded');
        return { skipped: true, reason: 'Already refunded' };
    }

    const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
    });

    console.log('[Stripe] Refund created successfully:', refund.id, 'Status:', refund.status);

    return refund;
};

module.exports = {
    createPaymentIntent,
    processRefund
};
