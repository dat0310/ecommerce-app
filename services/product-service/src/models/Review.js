const mongoose = require('mongoose');

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

// One review per user per product per order
reviewSchema.index({ orderId: 1, productId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
