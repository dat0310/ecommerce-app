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
    async updateStockAtomic(id, quantity) {
        return await Product.findOneAndUpdate(
            { _id: id, stock: { $gte: quantity } },
            { $inc: { stock: -quantity }, $set: { updatedAt: Date.now() } },
            { new: true }
        );
    }

    async updateCombinationStockAtomic(id, selectedOptions, quantity) {
        const product = await Product.findById(id);
        if (!product) return null;

        const comboIndex = product.productCombinations.findIndex(c => {
            const opts = c.options instanceof Map ? Object.fromEntries(c.options) : c.options;
            return Object.keys(selectedOptions).every(k => opts[k] === selectedOptions[k]);
        });

        if (comboIndex === -1) return null;
        const combo = product.productCombinations[comboIndex];
        const comboStock = combo.stock;

        if (comboStock < quantity || product.stock < quantity) return null;

        const updateQuery = {
            $inc: {
                stock: -quantity,
                [`productCombinations.${comboIndex}.stock`]: -quantity
            },
            $set: { updatedAt: Date.now() }
        };

        return await Product.findOneAndUpdate(
            {
                _id: id,
                stock: { $gte: quantity },
                [`productCombinations.${comboIndex}.stock`]: { $gte: quantity }
            },
            updateQuery,
            { new: true }
        );
    }
}

module.exports = new ProductRepository();
