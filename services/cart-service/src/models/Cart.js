const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: '' },
    quantity: { type: Number, default: 1, min: 1 },
    sellerId: { type: String, required: true },
    sellerName: { type: String, required: true },
    selectedOptions: { type: Map, of: String, default: {} }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    items: [cartItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
