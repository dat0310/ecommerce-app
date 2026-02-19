const Review = require('../models/Review');

class ReviewRepository {
    async findByProductId(productId) {
        return await Review.find({ productId }).sort({ createdAt: -1 });
    }

    async findByOrderUserAndProduct(orderId, userId, productId) {
        return await Review.findOne({ orderId, userId, productId });
    }

    async findByUserAndProduct(userId, productId) {
        return await Review.find({ userId, productId }).sort({ createdAt: -1 });
    }

    async create(reviewData) {
        const review = new Review(reviewData);
        return await review.save();
    }

    async getAverageRating(productId) {
        const result = await Review.aggregate([
            { $match: { productId } },
            { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
        ]);
        return result[0] || { avgRating: 0, count: 0 };
    }

    async deleteByOrderUserAndProduct(orderId, userId, productId) {
        return await Review.findOneAndDelete({ orderId, userId, productId });
    }

    async findByUserId(userId) {
        return await Review.find({ userId }).sort({ createdAt: -1 });
    }
}

module.exports = new ReviewRepository();
