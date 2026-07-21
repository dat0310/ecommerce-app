const productService = require('./product.service');

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
            const products = await productService.getPendingProducts();
            res.json(products);
        } catch (error) {
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

    async getShopProducts(req, res) {
        try {
            const data = await productService.getShopPublicProducts(req.params.sellerId);
            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createProduct(req, res) {
        try {
            const productData = req.body;
            const productImages = [];
            const optionImageMap = {};

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const filePath = `/uploads/products/${file.filename}`;
                    if (file.fieldname.startsWith('optionImage_')) {
                        optionImageMap[file.fieldname] = filePath;
                    } else {
                        productImages.push(filePath);
                    }
                }
            }

            if (productImages.length > 0) {
                productData.images = productImages;
                productData.image = productImages[0];
            }

            if (productData.variants) {
                productData.variants = JSON.parse(productData.variants);
                productData.variants.forEach((variant, vIdx) => {
                    variant.options.forEach((opt, oIdx) => {
                        const key = `optionImage_${vIdx}_${oIdx}`;
                        if (optionImageMap[key]) {
                            opt.image = optionImageMap[key];
                        }
                    });
                });

                if (productImages.length === 0) {
                    const allOptionImages = [];
                    productData.variants.forEach(v => {
                        v.options.forEach(o => {
                            if (o.image) allOptionImages.push(o.image);
                        });
                    });
                    if (allOptionImages.length > 0) {
                        productData.images = allOptionImages;
                        productData.image = allOptionImages[0];
                    }
                }
            }

            if (productData.productCombinations) {
                productData.productCombinations = JSON.parse(productData.productCombinations);
            }

            const product = await productService.createProduct(productData, req.user);
            res.status(201).json(product);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updateProduct(req, res) {
        try {
            const updateData = req.body;
            const productImages = [];
            const optionImageMap = {};
            let hasExistingImages = false;
            let existingImagesArray = [];

            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    const filePath = `/uploads/products/${file.filename}`;
                    if (file.fieldname.startsWith('optionImage_')) {
                        optionImageMap[file.fieldname] = filePath;
                    } else {
                        productImages.push(filePath);
                    }
                }
            }

            // Parse existing images first
            if (updateData.existingImages) {
                existingImagesArray = JSON.parse(updateData.existingImages);
                hasExistingImages = existingImagesArray.length > 0;
                delete updateData.existingImages;
            }

            // Set images: combine existing + new
            if (productImages.length > 0 || hasExistingImages) {
                updateData.images = [...existingImagesArray, ...productImages];
                updateData.image = updateData.images[0] || '';
            }

            if (updateData.variants) {
                updateData.variants = JSON.parse(updateData.variants);
                updateData.variants.forEach((variant, vIdx) => {
                    variant.options.forEach((opt, oIdx) => {
                        const key = `optionImage_${vIdx}_${oIdx}`;
                        if (optionImageMap[key]) {
                            opt.image = optionImageMap[key];
                        }
                    });
                });

                // Only use option images as product images if there are NO existing images AND NO new images
                if (productImages.length === 0 && !hasExistingImages && !updateData.images) {
                    const allOptionImages = [];
                    updateData.variants.forEach(v => {
                        v.options.forEach(o => {
                            if (o.image) allOptionImages.push(o.image);
                        });
                    });
                    if (allOptionImages.length > 0) {
                        updateData.images = allOptionImages;
                        updateData.image = allOptionImages[0];
                    }
                }
            }

            if (updateData.productCombinations) {
                updateData.productCombinations = JSON.parse(updateData.productCombinations);
            }

            const product = await productService.updateProduct(req.params.id, updateData, req.user);
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

    async reduceStock(req, res) {
        try {
            const { quantity, selectedOptions } = req.body;
            if (!quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid quantity' });
            }
            const product = await productService.reduceStock(req.params.id, quantity, selectedOptions);
            res.json({ message: 'Stock reduced successfully', product });
        } catch (error) {
            if (error.message.includes('Product not found') || error.message.includes('Insufficient stock')) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: error.message });
        }
    }

    async restoreStock(req, res) {
        try {
            const { quantity, selectedOptions } = req.body;
            if (!quantity || quantity <= 0) {
                return res.status(400).json({ message: 'Invalid quantity' });
            }
            const product = await productService.restoreStock(req.params.id, quantity, selectedOptions);
            res.json({ message: 'Stock restored successfully', product });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Review Controllers
    async getProductReviews(req, res) {
        try {
            const result = await productService.getProductReviews(req.params.id);
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

            const review = await productService.createReview(
                req.params.id,
                orderId,
                req.user.id,
                req.user.email,
                rating,
                comment || ''
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
            await productService.deleteReview(req.params.id, orderId, req.user.id);
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
            const reviews = await productService.getMyReviews(req.user.id);
            res.json(reviews);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ProductController();
