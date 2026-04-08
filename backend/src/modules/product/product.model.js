const mongoose = require('mongoose');
const { getConnection } = require('../../config/database');

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
            image: {
                type: String,
                default: ''
            }
        }]
    }],
    productCombinations: [{
        options: {
            type: Map,
            of: String
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0
        }
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

const reviewSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        index: true
    },
    orderId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

reviewSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });

let Product, Review;

const getProductModel = () => {
    if (!Product) {
        const conn = getConnection('product');
        Product = conn.model('Product', productSchema);
    }
    return Product;
};

const getReviewModel = () => {
    if (!Review) {
        const conn = getConnection('product');
        Review = conn.model('Review', reviewSchema);
    }
    return Review;
};

module.exports = { getProductModel, getReviewModel, productSchema, reviewSchema };
