const cartRepository = require('../repositories/cartRepository');
const axios = require('axios');

class CartService {
    async fetchProduct(productId, authHeader) {
        try {
            const { data } = await axios.get(`http://product-service:3001/api/products/${productId}`, {
                headers: authHeader ? { Authorization: authHeader } : undefined
            });
            return data;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error.message);
            return null;
        }
    }

    findCombinationPrice(product, selectedOptions) {
        if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
            return { price: product.price, stock: product.stock };
        }
        if (!product.productCombinations || product.productCombinations.length === 0) {
            return { price: product.price, stock: product.stock };
        }

        const combo = product.productCombinations.find(c => {
            const opts = c.options instanceof Map ? Object.fromEntries(c.options) : (c.options || {});
            return Object.keys(selectedOptions).every(k => opts[k] === selectedOptions[k]);
        });

        if (combo) {
            return { price: combo.price, stock: combo.stock };
        }
        return { price: product.price, stock: product.stock };
    }

    async getCart(userId) {
        const cart = await cartRepository.findByUserId(userId);
        return cart || { userId, items: [] };
    }

    async replaceCart(userId, items, authHeader) {
        const validatedItems = [];
        for (const item of items) {
            const p = await this.fetchProduct(item.productId, authHeader);
            if (!p || p.stock <= 0) continue;

            const selectedOptions = item.selectedOptions || {};
            const { price, stock } = this.findCombinationPrice(p, selectedOptions);
            const qty = Math.max(1, Math.min(item.quantity || 1, stock));

            validatedItems.push({
                productId: p._id,
                name: p.name,
                price,
                image: p.image,
                quantity: qty,
                sellerId: p.sellerId,
                sellerName: p.sellerName,
                selectedOptions
            });
        }
        return await cartRepository.createOrUpdate(userId, validatedItems);
    }

    async addItem(userId, productId, quantity, authHeader, selectedOptions = {}) {
        const product = await this.fetchProduct(productId, authHeader);
        if (!product || product.stock <= 0) {
            throw new Error('Product not available');
        }

        const { price, stock } = this.findCombinationPrice(product, selectedOptions);
        if (stock <= 0) {
            throw new Error('Selected variant is out of stock');
        }

        let cart = await cartRepository.findByUserId(userId);
        if (!cart) {
            cart = new (require('../models/Cart'))({ userId, items: [] });
        }

        const optionsKey = JSON.stringify(selectedOptions);
        const existing = cart.items.find(i => {
            const itemOpts = i.selectedOptions instanceof Map
                ? JSON.stringify(Object.fromEntries(i.selectedOptions))
                : JSON.stringify(i.selectedOptions || {});
            return i.productId === product._id && itemOpts === optionsKey;
        });

        if (existing) {
            existing.quantity = Math.min(existing.quantity + (quantity || 1), stock);
            existing.price = price;
        } else {
            cart.items.push({
                productId: product._id,
                name: product.name,
                price,
                image: product.image,
                quantity: Math.min(quantity || 1, stock),
                sellerId: product.sellerId,
                sellerName: product.sellerName,
                selectedOptions
            });
        }

        cart.updatedAt = Date.now();
        return await cartRepository.save(cart);
    }

    async updateItemQuantity(userId, productId, quantity, authHeader) {
        const product = await this.fetchProduct(productId, authHeader);
        if (!product) throw new Error('Product not found');

        const cart = await cartRepository.findByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(i => i.productId === product._id);
        if (!item) throw new Error('Item not found in cart');

        const selectedOptions = item.selectedOptions instanceof Map
            ? Object.fromEntries(item.selectedOptions)
            : (item.selectedOptions || {});
        const { stock } = this.findCombinationPrice(product, selectedOptions);

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.productId !== product._id);
        } else {
            item.quantity = Math.min(quantity, stock);
        }

        cart.updatedAt = Date.now();
        return await cartRepository.save(cart);
    }

    async removeItem(userId, productId) {
        const cart = await cartRepository.findByUserId(userId);
        if (!cart) throw new Error('Cart not found');

        const existingLength = cart.items.length;
        cart.items = cart.items.filter(i => i.productId !== productId);

        if (cart.items.length === existingLength) {
            throw new Error('Item not found in cart');
        }

        cart.updatedAt = Date.now();
        return await cartRepository.save(cart);
    }

    async clearCart(userId) {
        return await cartRepository.createOrUpdate(userId, []);
    }
}

module.exports = new CartService();
