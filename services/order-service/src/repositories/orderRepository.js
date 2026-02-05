const Order = require('../models/Order');

class OrderRepository {
    async countDocuments(query = {}) {
        return await Order.countDocuments(query);
    }

    async aggregate(pipeline) {
        return await Order.aggregate(pipeline);
    }

    async find(query = {}, sort = { createdAt: -1 }) {
        return await Order.find(query).sort(sort);
    }

    async findById(id) {
        return await Order.findById(id);
    }

    async create(orderData) {
        const order = new Order(orderData);
        return await order.save();
    }

    async updateById(id, updateData, options = { new: true, runValidators: true }) {
        return await Order.findByIdAndUpdate(id, updateData, options);
    }

    async deleteById(id) {
        return await Order.findByIdAndDelete(id);
    }
}

module.exports = new OrderRepository();
