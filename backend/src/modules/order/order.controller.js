const orderService = require('./order.service');
const mongoose = require('mongoose');

class OrderController {
    async healthCheck(req, res) {
        res.json({ status: 'OK', message: 'Order service is running' });
    }

    async getStats(req, res) {
        try {
            const stats = await orderService.getStats();
            res.json(stats);
        } catch (error) {
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
            if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
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
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refund_approved', 'refund_rejected', 'dispute_open', 'dispute_resolved'];
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
        try {
            console.log('[Order] Creating order with data:', JSON.stringify(req.body, null, 2));
            console.log('[Order] User:', req.user);
            const order = await orderService.createOrder(req.body, req.user);
            res.status(201).json(order);
        } catch (error) {
            console.error('[Order] Creation failed:', error.message);
            res.status(400).json({ message: error.message });
        }
    }

    async getOrderById(req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: 'Invalid Order ID format' });
            }
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        } catch (error) {
            if (error.message === 'Access denied') {
                return res.status(403).json({ message: 'Access denied.' });
            }
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
            res.json({ message: 'Order accepted successfully', order });
        } catch (error) {
            if (error.message.includes('Access denied')) return res.status(403).json({ message: error.message });
            if (error.message === 'Order not found') return res.status(404).json({ message: error.message });
            res.status(400).json({ message: error.message });
        }
    }

    async updateStatus(req, res) {
        try {
            const { status } = req.body;
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refund_requested', 'refund_approved', 'refund_rejected', 'dispute_open', 'dispute_resolved'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Invalid status specified.' });
            }
            const order = await orderService.updateStatus(req.params.id, status, req.user);
            res.json({ message: `Order status updated to ${status}`, order });
        } catch (error) {
            if (error.message.includes('Access denied')) return res.status(403).json({ message: error.message });
            if (error.message === 'Order not found') return res.status(404).json({ message: error.message });
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
            res.json({ message: `Payment status updated`, order });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async cancelOrder(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'You can only cancel your own orders.' });
            }
            const cancellable = ['pending', 'confirmed', 'processing'];
            if (!cancellable.includes(order.status)) {
                return res.status(400).json({ message: 'Only pending, confirmed, or processing orders can be cancelled.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'cancelled', req.user);
            res.json({ message: 'Order cancelled successfully', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async requestRefund(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'You can only request refund for your own orders.' });
            }
            if (!['delivered', 'completed'].includes(order.status)) {
                return res.status(400).json({ message: 'Only delivered or completed orders can be refunded.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'refund_requested', req.user);
            await orderService.updateOrder(req.params.id, {
                refundInfo: {
                    reason: req.body.reason || '',
                    description: req.body.description || '',
                    requestedAt: new Date(),
                    sellerResponse: 'pending'
                }
            });
            res.json({ message: 'Refund requested successfully', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async confirmReceived(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'You can only confirm your own orders.' });
            }
            if (order.status !== 'delivered') {
                return res.status(400).json({ message: 'Only delivered orders can be marked as received.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'completed', req.user);
            res.json({ message: 'Order marked as received', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async checkPurchase(req, res) {
        try {
            const { userId, productId, orderId } = req.query;
            if (!userId || !productId) {
                return res.status(400).json({ message: 'userId and productId are required' });
            }
            const purchased = await orderService.checkPurchase(userId, productId, orderId);
            res.json({ purchased });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async approveRefund(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            const isSellerForOrder = order.products && order.products.some(p => p.sellerId === req.user.id);
            if (!isSellerForOrder) {
                return res.status(403).json({ message: 'Access denied. You are not the seller for this order.' });
            }
            if (order.status !== 'refund_requested') {
                return res.status(400).json({ message: 'Only orders with refund_requested status can be approved.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'refund_approved', req.user);
            await orderService.updateOrder(req.params.id, {
                'refundInfo.sellerResponse': 'approved',
                'refundInfo.sellerNote': req.body.note || '',
                'refundInfo.sellerRespondedAt': new Date()
            });
            res.json({ message: 'Refund approved successfully', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async rejectRefund(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            const isSellerForOrder = order.products && order.products.some(p => p.sellerId === req.user.id);
            if (!isSellerForOrder) {
                return res.status(403).json({ message: 'Access denied. You are not the seller for this order.' });
            }
            if (order.status !== 'refund_requested') {
                return res.status(400).json({ message: 'Only orders with refund_requested status can be rejected.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'refund_rejected', req.user);
            await orderService.updateOrder(req.params.id, {
                'refundInfo.sellerResponse': 'rejected',
                'refundInfo.sellerNote': req.body.note || '',
                'refundInfo.sellerRespondedAt': new Date()
            });
            res.json({ message: 'Refund rejected', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async openDispute(req, res) {
        try {
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.userId !== req.user.id) {
                return res.status(403).json({ message: 'You can only open disputes for your own orders.' });
            }
            if (order.status !== 'refund_rejected') {
                return res.status(400).json({ message: 'You can only open a dispute after the seller has rejected your refund.' });
            }
            const updated = await orderService.updateStatus(req.params.id, 'dispute_open', req.user);
            res.json({ message: 'Dispute opened. Admin will review your case.', order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async resolveDispute(req, res) {
        try {
            const { resolution, note } = req.body;
            if (!['refund', 'reject'].includes(resolution)) {
                return res.status(400).json({ message: 'Resolution must be either "refund" or "reject".' });
            }
            const order = await orderService.getOrderById(req.params.id, req.user);
            if (!order) return res.status(404).json({ message: 'Order not found' });
            if (order.status !== 'dispute_open') {
                return res.status(400).json({ message: 'Only open disputes can be resolved.' });
            }
            const newStatus = resolution === 'refund' ? 'refund_approved' : 'dispute_resolved';
            const updated = await orderService.updateStatus(req.params.id, newStatus, req.user);
            await orderService.updateOrder(req.params.id, {
                'refundInfo.adminResolution': resolution,
                'refundInfo.adminNote': note || '',
                'refundInfo.adminResolvedAt': new Date()
            });
            const message = resolution === 'refund'
                ? 'Dispute resolved in favor of the buyer. Refund approved.'
                : 'Dispute resolved in favor of the seller. Refund rejected.';
            res.json({ message, order: updated });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new OrderController();
