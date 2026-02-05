const productService = require('../services/productService');

class ProductController {
    async getApprovedProducts(req, res) {
        try {
            const products = await productService.getApprovedProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSellerProducts(req, res) {
        try {
            const products = await productService.getSellerProducts(req.user.id);
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPendingProducts(req, res) {
        try {
            console.log('Getting pending products...');
            const products = await productService.getPendingProducts();
            console.log(`Found ${products.length} pending products`);
            res.json(products);
        } catch (error) {
            console.error('Error getting pending products:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async getAllProducts(req, res) {
        try {
            const products = await productService.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getProductById(req, res) {
        try {
            const userRole = req.user ? req.user.role : null;
            const product = await productService.getProductById(req.params.id, userRole);

            if (!product) return res.status(404).json({ message: 'Product not found' });
            res.json(product);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createProduct(req, res) {
        try {
            const product = await productService.createProduct(req.body, req.user, req.header('Authorization'));
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const product = await productService.updateProduct(req.params.id, req.body, req.user);
            res.json(product);
        } catch (error) {
            if (error.message.includes('Access denied')) return res.status(403).json({ error: { message: error.message } });
            if (error.message === 'Product not found') return res.status(404).json({ message: error.message });
            res.status(400).json({ error: { message: error.message } });
        }
    }

    async deleteProduct(req, res) {
        try {
            await productService.deleteProduct(req.params.id, req.user);
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            if (error.message.includes('Access denied')) return res.status(403).json({ error: { message: error.message } });
            if (error.message === 'Product not found') return res.status(404).json({ message: error.message });
            res.status(500).json({ error: { message: error.message } });
        }
    }

    async updateProductStatus(req, res) {
        try {
            const { status } = req.body;
            const product = await productService.updateProductStatus(req.params.id, status);
            if (!product) return res.status(404).json({ message: 'Product not found' });
            res.json({
                message: `Product ${status} successfully`,
                product
            });
        } catch (error) {
            res.status(400).json({ error: { message: error.message } });
        }
    }
}

module.exports = new ProductController();
