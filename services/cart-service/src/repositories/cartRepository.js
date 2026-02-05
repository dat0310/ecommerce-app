const Cart = require('../models/Cart');

class CartRepository {
    async findByUserId(userId) {
        return await Cart.findOne({ userId });
    }

    async createOrUpdate(userId, items) {
        return await Cart.findOneAndUpdate(
            { userId },
            { items, updatedAt: Date.now() },
            { upsert: true, new: true }
        );
    }

    async save(cart) {
        return await cart.save();
    }
}

module.exports = new CartRepository();
