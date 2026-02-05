const Product = require('../models/Product');

class ProductRepository {
    async create(productData) {
        const product = new Product(productData);
        return await product.save();
    }

    async findAll(query = {}, sort = { createdAt: -1 }) {
        return await Product.find(query).sort(sort);
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async updateById(id, updateData) {
        return await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }

    async deleteById(id) {
        return await Product.findByIdAndDelete(id);
    }
}

module.exports = new ProductRepository();
