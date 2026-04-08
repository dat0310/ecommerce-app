const { getOrderModel } = require('./order.model');
const { reduceStock, restoreStock } = require('../product/product.service');
const { deductCoins, refundCoins } = require('../coin/coin.service');

const generateOrderNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random}`;
};

const getStats = async () => {
    const Order = getOrderModel();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const revenueResult = await Order.aggregate([
        { $match: { status: { $in: ['completed', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    return {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
        totalRevenue: revenueResult[0]?.total || 0
    };
};

const getSellerOrders = async (sellerId) => {
    const Order = getOrderModel();
    return await Order.find({ 'products.sellerId': sellerId }).sort({ createdAt: -1 });
};

const getUserOrders = async (userId) => {
    const Order = getOrderModel();
    return await Order.find({ userId }).sort({ createdAt: -1 });
};

const getOrdersByUserId = async (userId) => {
    return await getUserOrders(userId);
};

const getOrdersByStatus = async (status) => {
    const Order = getOrderModel();
    return await Order.find({ status }).sort({ createdAt: -1 });
};

const getAllOrders = async () => {
    const Order = getOrderModel();
    return await Order.find({}).sort({ createdAt: -1 });
};

const getOrderById = async (id, user) => {
    const Order = getOrderModel();
    const order = await Order.findById(id);
    if (!order) return null;

    if (user.role === 'admin') return order;
    if (order.userId === user.id) return order;

    const isSellerForOrder = order.products && order.products.some(p => p.sellerId === user.id);
    if (isSellerForOrder) return order;

    throw new Error('Access denied');
};

const createOrder = async (orderData, user) => {
    const Order = getOrderModel();
    const reducedStockItems = [];

    try {
        // Reduce stock for each product
        for (const item of orderData.products) {
            const selectedOptions = item.selectedOptions instanceof Map
                ? Object.fromEntries(item.selectedOptions)
                : (item.selectedOptions || {});

            await reduceStock(item.productId, item.quantity, selectedOptions);
            reducedStockItems.push({ productId: item.productId, quantity: item.quantity, selectedOptions });
        }

        // Deduct coins if used (skip if already deducted by frontend)
        if (orderData.coinsUsed && orderData.coinsUsed > 0 && !orderData.coinsAlreadyDeducted) {
            await deductCoins(user.id, orderData.coinsUsed, 'Order payment');
        }

        // Redeem voucher if used
        if (orderData.voucher && orderData.voucher.code) {
            const { redeemVoucher } = require('../voucher/voucher.service');
            await redeemVoucher(user.id, orderData.voucher.code);
        }

        const order = new Order({
            ...orderData,
            userId: user.id,
            userEmail: user.email,
            orderNumber: generateOrderNumber(),
            status: 'pending',
            paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'pending')
        });

        return await order.save();
    } catch (error) {
        // Rollback: restore stock
        for (const item of reducedStockItems) {
            try {
                await restoreStock(item.productId, item.quantity, item.selectedOptions);
            } catch (e) {
                console.error('Failed to restore stock during rollback:', e);
            }
        }

        // Rollback: refund coins (always refund on failure, regardless of who deducted)
        if (orderData.coinsUsed && orderData.coinsUsed > 0) {
            try {
                await refundCoins(user.id, orderData.coinsUsed, 'Order creation failed - refund');
            } catch (e) {
                console.error('Failed to refund coins during rollback:', e);
            }
        }

        // Rollback: refund voucher
        if (orderData.voucher && orderData.voucher.code) {
            try {
                const { refundVoucher } = require('../voucher/voucher.service');
                await refundVoucher(user.id, orderData.voucher.code);
            } catch (e) {
                console.error('Failed to refund voucher during rollback:', e);
            }
        }

        throw error;
    }
};

const updateOrder = async (id, updateData) => {
    const Order = getOrderModel();
    updateData.updatedAt = Date.now();
    return await Order.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

const deleteOrder = async (id) => {
    const Order = getOrderModel();
    return await Order.findByIdAndDelete(id);
};

const acceptOrder = async (id, sellerId) => {
    const Order = getOrderModel();
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');

    const isSellerForOrder = order.products && order.products.some(p => p.sellerId === sellerId);
    if (!isSellerForOrder) {
        throw new Error('Access denied. You are not the seller for this order.');
    }

    if (order.status !== 'pending') {
        throw new Error('Only pending orders can be accepted.');
    }

    order.status = 'confirmed';
    order.updatedAt = Date.now();
    return await order.save();
};

const updateStatus = async (id, status, user) => {
    const Order = getOrderModel();
    const order = await Order.findById(id);
    if (!order) throw new Error('Order not found');

    // Handle refund logic when status becomes refund_approved
    if (status === 'refund_approved' && order.status !== 'refund_approved') {
        // Restore stock
        for (const item of order.products) {
            const selectedOptions = item.selectedOptions instanceof Map
                ? Object.fromEntries(item.selectedOptions)
                : (item.selectedOptions || {});
            try {
                await restoreStock(item.productId, item.quantity, selectedOptions);
            } catch (e) {
                console.error('Failed to restore stock during refund:', e);
            }
        }

        // Refund coins
        if (order.coinsUsed && order.coinsUsed > 0) {
            try {
                await refundCoins(order.userId, order.coinsUsed, 'Order refund');
            } catch (e) {
                console.error('Failed to refund coins:', e);
            }
        }

        // Refund voucher
        if (order.voucher && order.voucher.code) {
            try {
                const { refundVoucher } = require('../voucher/voucher.service');
                await refundVoucher(order.userId, order.voucher.code);
            } catch (e) {
                console.error('Failed to refund voucher:', e);
            }
        }

        // Process Stripe refund if applicable
        console.log('[Refund Check] paymentIntentId:', order.paymentIntentId, 'paymentStatus:', order.paymentStatus);
        if (order.paymentIntentId && order.paymentStatus === 'completed') {
            try {
                const { processRefund } = require('../payment/payment.service');
                const refundResult = await processRefund(order.paymentIntentId);
                console.log('[Refund] Stripe refund processed:', refundResult.id || refundResult);
            } catch (e) {
                console.error('[Refund] Failed to process Stripe refund:', e.message);
                // Don't throw - allow the order status to update even if Stripe fails
            }
        } else {
            console.log('[Refund] Skipping Stripe refund - missing paymentIntentId or paymentStatus is not completed');
        }

        order.paymentStatus = 'refunded';
    }

    // Handle cancellation logic
    if (status === 'cancelled' && order.status !== 'cancelled') {
        // Restore stock
        for (const item of order.products) {
            const selectedOptions = item.selectedOptions instanceof Map
                ? Object.fromEntries(item.selectedOptions)
                : (item.selectedOptions || {});
            try {
                await restoreStock(item.productId, item.quantity, selectedOptions);
            } catch (e) {
                console.error('Failed to restore stock during cancellation:', e);
            }
        }

        // Refund coins
        if (order.coinsUsed && order.coinsUsed > 0) {
            try {
                await refundCoins(order.userId, order.coinsUsed, 'Order cancelled - refund');
            } catch (e) {
                console.error('Failed to refund coins:', e);
            }
        }

        // Refund voucher
        if (order.voucher && order.voucher.code) {
            try {
                const { refundVoucher } = require('../voucher/voucher.service');
                await refundVoucher(order.userId, order.voucher.code);
            } catch (e) {
                console.error('Failed to refund voucher:', e);
            }
        }

        // Process Stripe refund for cancelled orders
        console.log('[Cancel Check] paymentIntentId:', order.paymentIntentId, 'paymentStatus:', order.paymentStatus);
        if (order.paymentIntentId && order.paymentStatus === 'completed') {
            try {
                const { processRefund } = require('../payment/payment.service');
                const refundResult = await processRefund(order.paymentIntentId);
                console.log('[Cancel] Stripe refund processed:', refundResult.id || refundResult);
                order.paymentStatus = 'refunded';
            } catch (e) {
                console.error('[Cancel] Failed to process Stripe refund:', e.message);
                // Don't throw - allow the order status to update even if Stripe fails
            }
        } else {
            console.log('[Cancel] Skipping Stripe refund - missing paymentIntentId or paymentStatus is not completed');
        }
    }

    order.status = status;
    order.updatedAt = Date.now();
    return await order.save();
};

const updatePaymentStatus = async (id, paymentStatus) => {
    const Order = getOrderModel();
    const status = paymentStatus === 'succeeded' ? 'completed' : paymentStatus;
    return await Order.findByIdAndUpdate(id, { paymentStatus: status, updatedAt: Date.now() }, { new: true });
};

const checkPurchase = async (userId, productId, orderId) => {
    const Order = getOrderModel();
    const query = {
        userId,
        'products.productId': productId,
        status: { $in: ['delivered', 'completed'] }
    };
    if (orderId) {
        query._id = orderId;
    }
    const order = await Order.findOne(query);
    return !!order;
};

module.exports = {
    getStats,
    getSellerOrders,
    getUserOrders,
    getOrdersByUserId,
    getOrdersByStatus,
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    acceptOrder,
    updateStatus,
    updatePaymentStatus,
    checkPurchase
};
