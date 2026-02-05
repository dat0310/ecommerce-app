const orderRepository = require('../repositories/orderRepository');

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

    async createOrder(orderData, user) {
        // Map Stripe 'succeeded' to 'completed' for paymentStatus
        let paymentStatus = orderData.paymentStatus;
        if (paymentStatus === 'succeeded') paymentStatus = 'completed';

        const newOrderData = {
            ...orderData,
            paymentStatus,
            userId: user.id,
            userEmail: user.email,
            orderNumber: this.generateOrderNumber(),
            updatedAt: Date.now()
        };

        return await orderRepository.create(newOrderData);
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

    async updateStatus(id, status, user) {
        const order = await orderRepository.findById(id);
        if (!order) throw new Error('Order not found');

        if (user.role === 'seller') {
            const isSellerForOrder = order.products.some(product => product.sellerId === user.id);
            if (!isSellerForOrder) {
                throw new Error('Access denied. You can only update status for orders containing your products.');
            }
        }

        return await orderRepository.updateById(id, {
            status,
            updatedAt: Date.now()
        });
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
