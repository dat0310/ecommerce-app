const reviewRepository = require('../repositories/reviewRepository');
const axios = require('axios');

const orderServiceUrl = process.env.ORDER_SERVICE_URL || 'http://order-service:3003';

class ReviewService {
    async getProductReviews(productId) {
        const reviews = await reviewRepository.findByProductId(productId);
        const stats = await reviewRepository.getAverageRating(productId);
        return {
            reviews,
            averageRating: Math.round((stats.avgRating || 0) * 10) / 10,
            totalReviews: stats.count || 0
        };
    }

    async createReview(productId, orderId, userId, userName, rating, comment, authHeader) {
        // 1. Check if user already reviewed this product for this order
        const existing = await reviewRepository.findByOrderUserAndProduct(orderId, userId, productId);
        if (existing) {
            throw new Error('You have already reviewed this product for this order');
        }

        // 2. Verify purchase with order-service (must be delivered)
        try {
            const token = authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`;
            const response = await axios.get(`${orderServiceUrl}/api/orders/check-purchase`, {
                params: { userId, productId, orderId },
                headers: { 'Authorization': token }
            });

            if (!response.data.purchased) {
                throw new Error('You can only review products from delivered orders');
            }
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.message || 'Failed to verify purchase');
            }
            throw error;
        }

        // 3. Create review
        return await reviewRepository.create({
            productId,
            orderId,
            userId,
            userName,
            rating,
            comment
        });
    }

    async deleteReview(productId, orderId, userId) {
        const review = await reviewRepository.deleteByOrderUserAndProduct(orderId, userId, productId);
        if (!review) {
            throw new Error('Review not found');
        }
        return review;
    }

    async getMyReviews(userId) {
        return await reviewRepository.findByUserId(userId);
    }
}

module.exports = new ReviewService();
