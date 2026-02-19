const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    variants: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        options: [{
            value: {
                type: String,
                required: true,
                trim: true
            },
            priceModifier: {
                type: Number,
                default: 0
            },
            stock: {
                type: Number,
                default: 0,
                min: 0
            }
        }]
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    sellerId: {
        type: String,
        required: true
    },
    sellerName: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    isActive: {
        type: Boolean,
        default: true
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

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
