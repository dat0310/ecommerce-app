if (!process.env.STRIPE_SECRET_KEY) {
    console.error('WARNING: STRIPE_SECRET_KEY is not set! Payment features will not work.');
}
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports = stripe;
