const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    products: [
        {
            productId: {
                type: String,
                required: true
            },
            productName: {
                type: String,
                required: true
            },
            sellerId: {
                type: String,
                required: true
            },
            sellerName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            price: {
                type: Number,
                required: true
            },
            image: {
                type: String
            },
            selectedOptions: {
                type: Map,
                of: String,
                default: {}
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        fullName: String,
        phoneNumber: String,
        cityDistrictWard: String,
        streetBuildingHouse: String,
        isDefault: Boolean
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'stripe', 'cash_on_delivery'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    orderNumber: {
        type: String,
        unique: true
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
