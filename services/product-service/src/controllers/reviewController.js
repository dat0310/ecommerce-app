const reviewService = require('../services/reviewService');

class ReviewController {
    async getProductReviews(req, res) {
        try {
            const result = await reviewService.getProductReviews(req.params.id);
            res.json(result);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createReview(req, res) {
        try {
            const { rating, comment, orderId } = req.body;

            if (!rating || rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Rating must be between 1 and 5' });
            }

            if (!orderId) {
                return res.status(400).json({ message: 'orderId is required' });
            }

            const authHeader = req.header('Authorization');
            const review = await reviewService.createReview(
                req.params.id,
                orderId,
                req.user.id,
                req.user.email,
                rating,
                comment || '',
                authHeader
            );

            res.status(201).json(review);
        } catch (error) {
            if (error.message.includes('already reviewed') || error.message.includes('only review')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async deleteReview(req, res) {
        try {
            const { orderId } = req.body;
            await reviewService.deleteReview(req.params.id, orderId, req.user.id);
            res.json({ message: 'Review deleted successfully' });
        } catch (error) {
            if (error.message === 'Review not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async getMyReviews(req, res) {
        try {
            const reviews = await reviewService.getMyReviews(req.user.id);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ReviewController();
