const cartService = require('./cart.service');

class CartController {
    async getCart(req, res) {
        try {
            const cart = await cartService.getCart(req.user.id);
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async replaceCart(req, res) {
        try {
            const { items } = req.body;
            if (!Array.isArray(items)) {
                return res.status(400).json({ message: 'Items must be an array' });
            }
            const cart = await cartService.replaceCart(req.user.id, items);
            res.json(cart);
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async addItem(req, res) {
        try {
            const { productId, quantity, selectedOptions } = req.body;
            if (!productId) return res.status(400).json({ message: 'productId is required' });

            const cart = await cartService.addItem(req.user.id, productId, quantity, selectedOptions || {});
            res.status(201).json(cart);
        } catch (error) {
            if (error.message === 'Product not available' || error.message === 'Selected variant is out of stock') {
                return res.status(400).json({ message: error.message });
            }
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async updateItem(req, res) {
        try {
            const { quantity } = req.body;
            if (quantity == null) return res.status(400).json({ message: 'quantity is required' });

            const cart = await cartService.updateItemQuantity(req.user.id, req.params.productId, quantity);
            res.json(cart);
        } catch (error) {
            if (error.message === 'Product not found') return res.status(404).json({ message: error.message });
            if (error.message === 'Cart not found') return res.status(404).json({ message: 'Cart not found' });
            if (error.message === 'Item not found in cart') return res.status(404).json({ message: 'Item not found in cart' });
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async removeItem(req, res) {
        try {
            const cart = await cartService.removeItem(req.user.id, req.params.productId);
            res.json(cart);
        } catch (error) {
            if (error.message === 'Cart not found') return res.status(404).json({ message: 'Cart not found' });
            if (error.message === 'Item not found in cart') return res.status(404).json({ message: 'Item not found in cart' });
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async clearCart(req, res) {
        try {
            const cart = await cartService.clearCart(req.user.id);
            res.json(cart || { userId: req.user.id, items: [] });
        } catch (error) {
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async healthCheck(req, res) {
        res.json({ status: 'OK', service: 'cart-service' });
    }
}

module.exports = new CartController();
