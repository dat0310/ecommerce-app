const cartRepository = require('../repositories/cartRepository');
const axios = require('axios');
const Cart = require('../models/Cart'); // Needed for new Cart() if repo doesn't handle creation well (repo handles upsert)

class CartService {
    async fetchProduct(productId, authHeader) {
        // Call product-service directly inside docker network
        try {
            // If authHeader is needed by product-service (e.g. for pending/unapproved check?), pass it.
            // Usually standard approved products are public.
            const { data } = await axios.get(`http://product-service:3001/api/products/${productId}`, {
                headers: authHeader ? { Authorization: authHeader } : undefined
            });
            return data;
        } catch (error) {
            console.error(`Error fetching product ${productId}:`, error.message);
            return null;
        }
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
            const qty = Math.max(1, Math.min(item.quantity || 1, p.stock));
            validatedItems.push({
                productId: p._id,
                name: p.name,
                price: p.price,
                image: p.image,
                quantity: qty,
                sellerId: p.sellerId,
                sellerName: p.sellerName
            });
        }
        return await cartRepository.createOrUpdate(userId, validatedItems);
    }

    async addItem(userId, productId, quantity, authHeader) {
        const product = await this.fetchProduct(productId, authHeader);
        if (!product || product.stock <= 0) {
            throw new Error('Product not available');
        }

        let cart = await cartRepository.findByUserId(userId);
        if (!cart) {
            // Create empty cart object (not saved yet logic usually, but repo has upsert)
            // We can use repo findByUserId which returns null, so we construct.
            // Actually, easier to let repo handle "get or create" or logic here.
            // Let's rely on Mongoose document nature if we got one, else new.
            // But repo.findByUserId returns a document.
            // If null, we create new Cart model logic here or we can use repo.
            // To simplify, let's just create new instance if needed.
            // We need `new Cart` but that requires importing Model in Service?
            // Better: abstract "getOrCreate" in Repo?
            // Or just:
            cart = new (require('../models/Cart'))({ userId, items: [] });
        }

        const existing = cart.items.find(i => i.productId === product._id);
        const newQty = Math.max(1, Math.min((existing?.quantity || 0) + (quantity || 1), product.stock));

        if (existing) {
            existing.quantity = newQty;
        } else {
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: Math.min(quantity || 1, product.stock),
                sellerId: product.sellerId,
                sellerName: product.sellerName
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

        if (quantity <= 0) {
            cart.items = cart.items.filter(i => i.productId !== product._id);
        } else {
            item.quantity = Math.min(quantity, product.stock);
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
