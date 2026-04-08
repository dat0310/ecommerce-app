const { getProductModel, getReviewModel } = require('./product.model');
const { getUserModel } = require('../user/user.model');

// Product Service Functions
const getApprovedProducts = async () => {
    const Product = getProductModel();
    return await Product.find({ status: 'approved', isActive: true }).sort({ createdAt: -1 });
};

const getSellerProducts = async (sellerId) => {
    const Product = getProductModel();
    return await Product.find({ sellerId }).sort({ createdAt: -1 });
};

const getPendingProducts = async () => {
    const Product = getProductModel();
    return await Product.find({ status: 'pending' }).sort({ createdAt: -1 });
};

const getAllProducts = async () => {
    const Product = getProductModel();
    return await Product.find({}).sort({ createdAt: -1 });
};

const getProductById = async (id, userRole) => {
    const Product = getProductModel();
    const product = await Product.findById(id);
    if (!product) return null;

    if (product.status !== 'approved' && (!userRole || userRole !== 'admin')) {
        return null;
    }

    return product;
};

const createProduct = async (productData, user) => {
    const Product = getProductModel();
    let sellerName = user.email.split('@')[0];

    try {
        const User = getUserModel();
        const userDoc = await User.findById(user.id);
        if (userDoc && userDoc.firstName && userDoc.lastName) {
            sellerName = `${userDoc.firstName} ${userDoc.lastName}`;
        }
    } catch (e) {
        console.log('Could not fetch user details, using email prefix as fallback');
    }

    const newProductData = {
        ...productData,
        sellerId: user.id,
        sellerName: sellerName,
        status: 'pending',
        updatedAt: Date.now()
    };

    const product = new Product(newProductData);
    return await product.save();
};

const updateProduct = async (id, updateData, user) => {
    const Product = getProductModel();
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');

    if (user.role !== 'admin' && product.sellerId !== user.id) {
        throw new Error('Access denied. You can only update your own products.');
    }

    updateData.updatedAt = Date.now();
    return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteProduct = async (id, user) => {
    const Product = getProductModel();
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');

    if (user.role !== 'admin' && product.sellerId !== user.id) {
        throw new Error('Access denied. You can only delete your own products.');
    }

    return await Product.findByIdAndDelete(id);
};

const updateProductStatus = async (id, status) => {
    const Product = getProductModel();
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
        throw new Error('Invalid status specified.');
    }

    return await Product.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true });
};

const reduceStock = async (id, quantity, selectedOptions) => {
    const Product = getProductModel();

    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        const product = await Product.findById(id);
        if (!product) throw new Error('Product not found');

        const comboIndex = product.productCombinations.findIndex(c => {
            const opts = c.options instanceof Map ? Object.fromEntries(c.options) : c.options;
            return Object.keys(selectedOptions).every(k => opts[k] === selectedOptions[k]);
        });

        if (comboIndex === -1) throw new Error('Product combination not found');

        const combo = product.productCombinations[comboIndex];
        if (combo.stock < quantity || product.stock < quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
        }

        return await Product.findOneAndUpdate(
            {
                _id: id,
                stock: { $gte: quantity },
                [`productCombinations.${comboIndex}.stock`]: { $gte: quantity }
            },
            {
                $inc: {
                    stock: -quantity,
                    [`productCombinations.${comboIndex}.stock`]: -quantity
                },
                $set: { updatedAt: Date.now() }
            },
            { new: true }
        );
    } else {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity }, $set: { updatedAt: Date.now() } },
            { new: true }
        );

        if (!updatedProduct) {
            const product = await Product.findById(id);
            if (!product) throw new Error('Product not found');
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}`);
        }
        return updatedProduct;
    }
};

const restoreStock = async (id, quantity, selectedOptions) => {
    const Product = getProductModel();

    if (selectedOptions && Object.keys(selectedOptions).length > 0) {
        const product = await Product.findById(id);
        if (!product) return null;

        const comboIndex = product.productCombinations.findIndex(c => {
            const opts = c.options instanceof Map ? Object.fromEntries(c.options) : c.options;
            return Object.keys(selectedOptions).every(k => opts[k] === selectedOptions[k]);
        });

        if (comboIndex === -1) return null;

        return await Product.findByIdAndUpdate(
            id,
            {
                $inc: {
                    stock: quantity,
                    [`productCombinations.${comboIndex}.stock`]: quantity
                },
                $set: { updatedAt: Date.now() }
            },
            { new: true }
        );
    }

    return await Product.findByIdAndUpdate(
        id,
        { $inc: { stock: quantity }, $set: { updatedAt: Date.now() } },
        { new: true }
    );
};

// Review Service Functions
const getProductReviews = async (productId) => {
    const Review = getReviewModel();
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    const stats = await Review.aggregate([
        { $match: { productId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const stat = stats[0] || { avgRating: 0, count: 0 };
    return {
        reviews,
        averageRating: Math.round((stat.avgRating || 0) * 10) / 10,
        totalReviews: stat.count || 0
    };
};

const createReview = async (productId, orderId, userId, userName, rating, comment) => {
    const Review = getReviewModel();

    const existing = await Review.findOne({ orderId, userId, productId });
    if (existing) {
        throw new Error('You have already reviewed this product for this order');
    }

    // Verify purchase using order service (direct call)
    const { checkPurchase } = require('../order/order.service');
    const purchased = await checkPurchase(userId, productId, orderId);
    if (!purchased) {
        throw new Error('You can only review products from delivered orders');
    }

    const review = new Review({
        productId,
        orderId,
        userId,
        userName,
        rating,
        comment
    });

    const savedReview = await review.save();

    // Award coins for review (fire and forget)
    try {
        const { earnReviewCoins } = require('../coin/coin.service');
        await earnReviewCoins(userId);
    } catch (e) {
        console.error('Failed to award review coins:', e.message);
    }

    return savedReview;
};

const deleteReview = async (productId, orderId, userId) => {
    const Review = getReviewModel();
    const review = await Review.findOneAndDelete({ orderId, userId, productId });
    if (!review) {
        throw new Error('Review not found');
    }
    return review;
};

const getMyReviews = async (userId) => {
    const Review = getReviewModel();
    return await Review.find({ userId }).sort({ createdAt: -1 });
};

module.exports = {
    getApprovedProducts,
    getSellerProducts,
    getPendingProducts,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    reduceStock,
    restoreStock,
    getProductReviews,
    createReview,
    deleteReview,
    getMyReviews
};
