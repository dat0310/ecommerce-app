const orderRepository = require('../repositories/orderRepository');

const axios = require('axios');
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001';
const coinServiceUrl = process.env.COIN_SERVICE_URL || 'http://localhost:3008';
const voucherServiceUrl = process.env.VOUCHER_SERVICE_URL || 'http://localhost:3007';

class OrderService {
    generateOrderNumber() {
        return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    async getStats() {
        const totalOrders = await orderRepository.countDocuments();
        const pendingOrders = await orderRepository.countDocuments({ status: 'pending' });
        const confirmedOrders = await orderRepository.countDocuments({ status: 'confirmed' });
        const processingOrders = await orderRepository.countDocuments({ status: 'processing' });
        const shippedOrders = await orderRepository.countDocuments({ status: 'shipped' });
        const deliveredOrders = await orderRepository.countDocuments({ status: 'delivered' });
        const completedOrders = await orderRepository.countDocuments({ status: 'completed' });
        const cancelledOrders = await orderRepository.countDocuments({ status: 'cancelled' });

        const totalRevenue = await orderRepository.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        return {
            totalOrders,
            pendingOrders,
            confirmedOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders,
            completedOrders,
            cancelledOrders,
            totalRevenue: totalRevenue[0]?.total || 0
        };
    }

    async getSellerOrders(sellerId) {
        // Find orders containing at least one product from this seller
        const orders = await orderRepository.find({ 'products.sellerId': sellerId });

        // Filter the products array in each order to ONLY show this seller's products
        return orders.map(order => {
            const orderObj = order.toObject();
            orderObj.products = orderObj.products.filter(p => p.sellerId === sellerId);
            return orderObj;
        });
    }

    async getUserOrders(userId) {
        return await orderRepository.find({ userId });
    }

    async getOrdersByStatus(status) {
        return await orderRepository.find({ status });
    }

    async getAllOrders() {
        return await orderRepository.find();
    }

    async createOrder(orderData, user, authHeader) {
        // Map Stripe 'succeeded' to 'completed' for paymentStatus
        let paymentStatus = orderData.paymentStatus;
        if (paymentStatus === 'succeeded') paymentStatus = 'completed';

        const token = authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`;

        // 0. Deduct coins if used (skip if already deducted by frontend for Stripe flow)
        let coinsUsed = parseInt(orderData.coinsUsed) || 0;
        let coinDiscount = 0;
        const coinsAlreadyDeducted = orderData.coinsAlreadyDeducted === true;
        if (coinsUsed > 0) {
            coinDiscount = coinsUsed / 1000; // 1000 coins = $1
            if (!coinsAlreadyDeducted) {
                try {
                    await axios.post(`${coinServiceUrl}/deduct`, {
                        userId: user.id,
                        amount: coinsUsed,
                        description: 'Order discount'
                    }, { headers: { 'Authorization': token } });
                } catch (coinError) {
                    const errorDetail = coinError.response?.data?.message || coinError.response?.data?.error?.message || coinError.message;
                    throw new Error(`Failed to deduct coins: ${errorDetail}`);
                }
            }
        }

        // 1. Redeem Voucher if present
        let voucherRedeemed = false;
        if (orderData.voucher && orderData.voucher.code) {
            try {
                await axios.post(`${voucherServiceUrl}/api/vouchers/redeem`, {
                    code: orderData.voucher.code
                }, { headers: { 'Authorization': token } });
                voucherRedeemed = true;
            } catch (voucherError) {
                // Rollback coins if deducted
                if (coinsUsed > 0) {
                    try {
                        await axios.post(`${coinServiceUrl}/refund`, {
                            userId: user.id,
                            amount: coinsUsed,
                            description: 'Order failed - coin refund'
                        }, { headers: { 'Authorization': token } });
                    } catch (e) { console.error('CRITICAL: Failed to refund coins', e.message); }
                }
                throw new Error(voucherError.response?.data?.message || 'Failed to redeem voucher');
            }
        }

        // 2. Reduce Stock for all products
        const reducedProducts = [];
        try {
            for (const item of orderData.products) {
                try {
                    await axios.patch(`${productServiceUrl}/api/products/${item.productId}/reduce-stock`,
                        { quantity: item.quantity, selectedOptions: item.selectedOptions || {} },
                        { headers: { 'Authorization': token } }
                    );
                    reducedProducts.push(item);
                } catch (reduceError) {
                    console.error(`Failed to reduce stock for product ${item.productId}:`, reduceError.response?.data || reduceError.message);
                    throw new Error(reduceError.response?.data?.message || 'Insufficient stock or product error');
                }
            }
        } catch (error) {
            // Rollback: Restore stock for already reduced products
            console.log('Rolling back stock reduction...');
            for (const item of reducedProducts) {
                try {
                    await axios.patch(`${productServiceUrl}/api/products/${item.productId}/restore-stock`,
                        { quantity: item.quantity, selectedOptions: item.selectedOptions || {} },
                        { headers: { 'Authorization': token } }
                    );
                } catch (restoreError) {
                    console.error(`CRITICAL: Failed to rollback stock for product ${item.productId}`, restoreError.message);
                }
            }
            // Rollback Voucher
            if (voucherRedeemed) {
                try {
                    await axios.post(`${voucherServiceUrl}/api/vouchers/refund`, {
                        code: orderData.voucher.code
                    }, { headers: { 'Authorization': token } });
                } catch (e) { console.error('CRITICAL: Failed to refund voucher', e.message); }
            }
            // Rollback coins if deducted
            if (coinsUsed > 0) {
                try {
                    await axios.post(`${coinServiceUrl}/refund`, {
                        userId: user.id,
                        amount: coinsUsed,
                        description: 'Order failed - coin refund'
                    }, { headers: { 'Authorization': token } });
                } catch (e) { console.error('CRITICAL: Failed to refund coins', e.message); }
            }
            throw error;
        }

        // Remove transient flow-control flags before saving
        const { coinsAlreadyDeducted: _discardFlag, ...cleanOrderData } = orderData;

        const newOrderData = {
            ...cleanOrderData,
            paymentStatus,
            userId: user.id,
            userEmail: user.email,
            orderNumber: this.generateOrderNumber(),
            coinsUsed,
            coinDiscount,
            updatedAt: Date.now()
        };

        try {
            return await orderRepository.create(newOrderData);
        } catch (dbError) {
            // Rollback stock if DB creation fails
            console.log('Order creation failed, rolling back...');
            for (const item of reducedProducts) {
                try {
                    await axios.patch(`${productServiceUrl}/api/products/${item.productId}/restore-stock`,
                        { quantity: item.quantity, selectedOptions: item.selectedOptions || {} },
                        { headers: { 'Authorization': token } }
                    );
                } catch (restoreError) {
                    console.error(`CRITICAL: Failed to rollback stock for product ${item.productId}`, restoreError.message);
                }
            }
            // Rollback Voucher
            if (voucherRedeemed) {
                try {
                    await axios.post(`${voucherServiceUrl}/api/vouchers/refund`, {
                        code: orderData.voucher.code
                    }, { headers: { 'Authorization': token } });
                } catch (e) { console.error('CRITICAL: Failed to refund voucher', e.message); }
            }
            // Rollback coins if deducted
            if (coinsUsed > 0) {
                try {
                    await axios.post(`${coinServiceUrl}/refund`, {
                        userId: user.id,
                        amount: coinsUsed,
                        description: 'Order failed - coin refund'
                    }, { headers: { 'Authorization': token } });
                } catch (e) { console.error('CRITICAL: Failed to refund coins', e.message); }
            }
            throw dbError;
        }
    }

    async getOrderById(id, user) {
        const order = await orderRepository.findById(id);
        if (!order) return null;

        const userId = user.id;
        const isAdmin = user.role === 'admin';
        const isOwner = order.userId === userId;
        // Check if user is a seller for ANY product in the order
        const isSellerForOrder = user.role === 'seller' && order.products.some(p => p.sellerId === userId);

        if (!isAdmin && !isOwner && !isSellerForOrder) {
            throw new Error('Access denied');
        }

        if (isSellerForOrder && !isAdmin && !isOwner) {
            const orderObj = order.toObject();
            orderObj.products = orderObj.products.filter(p => p.sellerId === userId);
            return orderObj;
        }

        return order;
    }

    async updateOrder(id, updateData) {
        updateData.updatedAt = Date.now();
        return await orderRepository.updateById(id, updateData);
    }

    async deleteOrder(id) {
        return await orderRepository.deleteById(id);
    }

    async acceptOrder(id, sellerId) {
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Order not found');

        const isSellerForOrder = order.products.some(product => product.sellerId === sellerId);
        if (!isSellerForOrder) {
            throw new Error('Access denied. You can only accept orders containing your products.');
        }

        if (order.status !== 'pending') {
            throw new Error('Only pending orders can be accepted.');
        }

        return await orderRepository.updateById(id, {
            status: 'confirmed',
            updatedAt: Date.now()
        });
    }

    async updateStatus(id, status, user, authHeader) {
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Order not found');

        if (user.role === 'seller') {
            const isSellerForOrder = order.products.some(product => product.sellerId === user.id);
            if (!isSellerForOrder) {
                throw new Error('Access denied. You can only update status for orders containing your products.');
            }
            // Sellers cannot mark orders as "completed" — only buyers can confirm receipt
            if (status === 'completed') {
                throw new Error('Sellers cannot mark orders as completed. Only the buyer can confirm receipt.');
            }
        }

        // Handle cancellations
        if (status === 'cancelled' && order.status !== 'cancelled') {
            const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : '';

            // Refund Coins
            if (order.coinsUsed > 0 && token) {
                try {
                    await axios.post(`${coinServiceUrl}/refund`, {
                        userId: order.userId,
                        amount: order.coinsUsed,
                        description: `Refund for cancelled order ${order.orderNumber}`
                    }, { headers: { 'Authorization': token } });
                    console.log(`Refunded ${order.coinsUsed} coins for order ${order.orderNumber}`);
                } catch (error) {
                    console.error('CRITICAL: Failed to refund coins on cancellation', error.message);
                }
            }

            // Refund Voucher
            if (order.voucher && order.voucher.code && token) {
                try {
                    await axios.post(`${voucherServiceUrl}/api/vouchers/refund`, {
                        code: order.voucher.code
                    }, { headers: { 'Authorization': token } });
                    console.log(`Refunded voucher ${order.voucher.code} for order ${order.orderNumber}`);
                } catch (error) {
                    console.error('CRITICAL: Failed to refund voucher on cancellation', error.message);
                }
            }
        }

        return await orderRepository.updateById(id, {
            status,
            updatedAt: Date.now()
        });
    }

    async checkPurchase(userId, productId, orderId) {
        const query = {
            userId,
            status: { $in: ['delivered', 'completed'] },
            'products.productId': productId
        };
        if (orderId) {
            query._id = orderId;
        }
        const order = await orderRepository.find(query);
        return order && order.length > 0;
    }

    async updatePaymentStatus(id, paymentStatus) {
        let status = paymentStatus;
        if (status === 'succeeded') status = 'completed';

        return await orderRepository.updateById(id, {
            paymentStatus: status,
            updatedAt: Date.now()
        });
    }
}

module.exports = new OrderService();
