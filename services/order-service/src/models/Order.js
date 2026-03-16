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
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refund_approved', 'refund_rejected', 'dispute_open', 'dispute_resolved'],
        default: 'pending'
    },
    coinsUsed: {
        type: Number,
        default: 0
    },
    coinDiscount: {
        type: Number,
        default: 0
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
    voucher: {
        code: { type: String },
        discountType: { type: String, enum: ['percentage', 'fixed'] },
        discountValue: { type: Number },
        discountAmount: { type: Number }
    },
    notes: {
        type: String,
        default: ''
    },
    refundInfo: {
        reason: { type: String, default: '' },
        description: { type: String, default: '' },
        requestedAt: { type: Date },
        sellerResponse: {
            type: String,
            enum: ['pending', 'approved', 'rejected', null],
            default: null
        },
        sellerNote: { type: String, default: '' },
        sellerRespondedAt: { type: Date },
        adminResolution: {
            type: String,
            enum: ['refund', 'reject', null],
            default: null
        },
        adminNote: { type: String, default: '' },
        adminResolvedAt: { type: Date }
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
