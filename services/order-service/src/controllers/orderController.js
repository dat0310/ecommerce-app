const orderService = require('../services/orderService');
const mongoose = require('mongoose');

class OrderController {
    async healthCheck(req, res) {
        if (mongoose.connection.readyState === 1) {
            res.json({ status: 'OK', message: 'Order service is running and connected to MongoDB' });
        } else {
            res.status(500).json({ status: 'Error', message: 'Order service is not connected to MongoDB' });
        }
    }

    async getStats(req, res) {
        try {
            const stats = await orderService.getStats();
            res.json(stats);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message });
        }
    }

    async getSellerOrders(req, res) {
        try {
            const orders = await orderService.getSellerOrders(req.user.id);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getUserOrders(req, res) {
        try {
            console.log('getUserOrders - req.params.userId:', req.params.userId, 'type:', typeof req.params.userId);
            console.log('getUserOrders - req.user.id:', req.user.id, 'type:', typeof req.user.id);
            console.log('getUserOrders - req.user:', JSON.stringify(req.user));
            if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
                console.log('Access denied - IDs do not match');
                return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
            }
            const orders = await orderService.getUserOrders(req.params.userId);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getOrdersByStatus(req, res) {
        try {
            const { status } = req.params;
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status specified.' });
            }

            const orders = await orderService.getOrdersByStatus(status);
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAllOrders(req, res) {
        try {
            const orders = await orderService.getAllOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async createOrder(req, res) {
        console.log('Creating a new order...');
        try {
            const order = await orderService.createOrder(req.body, req.user);
            res.status(201).json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid Order ID format' });
            }

            try {
                const order = await orderService.getOrderById(req.params.id, req.user);
                if (!order) return res.status(404).json({ message: 'Order not found' });
                res.json(order);
            } catch (err) {
                if (err.message === 'Access denied') {
                    return res.status(403).json({ message: 'Access denied.' });
                }
                throw err;
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateOrder(req, res) {
        try {
            const order = await orderService.updateOrder(req.params.id, req.body);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deleteOrder(req, res) {
        try {
            const order = await orderService.deleteOrder(req.params.id);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json({ message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async acceptOrder(req, res) {
        try {
            const order = await orderService.acceptOrder(req.params.id, req.user.id);
            res.json({
                message: 'Order accepted successfully',
                order
            });
        } catch (error) {
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message === 'Order not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status specified.' });
            }

            const order = await orderService.updateStatus(req.params.id, status, req.user);
            res.json({
                message: `Order status updated to ${status}`,
                order
            });
        } catch (error) {
            if (error.message.includes('Access denied')) {
                return res.status(403).json({ message: error.message });
            }
            if (error.message === 'Order not found') {
                return res.status(404).json({ message: error.message });
            }
            res.status(400).json({ message: error.message });
        }
    }

    async updatePaymentStatus(req, res) {
        try {
            const { paymentStatus } = req.body;
            const validStatuses = ['pending', 'completed', 'failed', 'refunded', 'succeeded'];

            if (!validStatuses.includes(paymentStatus)) {
                return res.status(400).json({ message: 'Invalid payment status specified.' });
            }

            const order = await orderService.updatePaymentStatus(req.params.id, paymentStatus);
            if (!order) return res.status(404).json({ message: 'Order not found' });

            res.json({
                message: `Payment status updated to ${paymentStatus === 'succeeded' ? 'completed' : paymentStatus}`,
                order
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
