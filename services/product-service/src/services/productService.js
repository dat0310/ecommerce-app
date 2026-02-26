const productRepository = require('../repositories/productRepository');
const axios = require('axios');

class ProductService {
    async getApprovedProducts() {
        return await productRepository.findAll({ status: 'approved', isActive: true });
    }

    async getSellerProducts(sellerId) {
        return await productRepository.findAll({ sellerId });
    }

    async getPendingProducts() {
        return await productRepository.findAll({ status: 'pending' });
    }

    async getAllProducts() {
        return await productRepository.findAll({});
    }

    async getProductById(id, userRole) {
        const product = await productRepository.findById(id);
        if (!product) return null;

        // Only show approved products to public unless admin
        if (product.status !== 'approved' && (!userRole || userRole !== 'admin')) {
            return null;
        }

        return product;
    }

    async createProduct(productData, user, authHeader) {
        let sellerName = user.email.split('@')[0]; // fallback
        try {
            const userResponse = await axios.get(`http://user-service:3002/api/users/${user.id}`, {
                headers: { 'Authorization': `Bearer ${authHeader?.replace('Bearer ', '')}` }
            });
            if (userResponse.data && userResponse.data.firstName && userResponse.data.lastName) {
                sellerName = `${userResponse.data.firstName} ${userResponse.data.lastName}`;
            }
        } catch (userError) {
            console.log('Could not fetch user details, using email prefix as fallback');
        }

        const newProductData = {
            ...productData,
            sellerId: user.id,
            sellerName: sellerName,
            status: 'pending',
            updatedAt: Date.now()
        };

        return await productRepository.create(newProductData);
    }

    async updateProduct(id, updateData, user) {
        const product = await productRepository.findById(id);
        if (!product) throw new Error('Product not found');

        // Check if user can update this product
        if (user.role !== 'admin' && product.sellerId !== user.id) {
            throw new Error('Access denied. You can only update your own products.');
        }

        updateData.updatedAt = Date.now();
        return await productRepository.updateById(id, updateData);
    }

    async deleteProduct(id, user) {
        const product = await productRepository.findById(id);
        if (!product) throw new Error('Product not found');

        if (user.role !== 'admin' && product.sellerId !== user.id) {
            throw new Error('Access denied. You can only delete your own products.');
        }

        return await productRepository.deleteById(id);
    }

    async updateProductStatus(id, status) {
        const validStatuses = ['pending', 'approved', 'rejected'];
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid status specified.');
        }

        return await productRepository.updateById(id, {
            status,
            updatedAt: Date.now()
        });
    }
    async reduceStock(id, quantity, selectedOptions) {
        let updatedProduct;
        if (selectedOptions && Object.keys(selectedOptions).length > 0) {
            updatedProduct = await productRepository.updateCombinationStockAtomic(id, selectedOptions, quantity);
        } else {
            updatedProduct = await productRepository.updateStockAtomic(id, quantity);
        }
        if (!updatedProduct) {
            const product = await productRepository.findById(id);
            if (!product) throw new Error('Product not found');
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
        }
        return updatedProduct;
    }

    async restoreStock(id, quantity, selectedOptions) {
        if (selectedOptions && Object.keys(selectedOptions).length > 0) {
            return await productRepository.updateCombinationStockAtomic(id, selectedOptions, -quantity);
        }
        return await productRepository.updateStockAtomic(id, -quantity);
    }
}

module.exports = new ProductService();
