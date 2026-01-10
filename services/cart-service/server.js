const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Cart Item subdocument
const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, default: 1, min: 1 },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true }
}, { _id: false });

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

const Cart = mongoose.model('Cart', cartSchema);

// Middleware to verify JWT token and normalize req.user
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: { message: 'Access denied. No token provided.' } });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      email: decoded.email,
      role: decoded.role || 'customer'
    };
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Token is not valid.' } });
  }
};

// Helpers
const fetchProduct = async (productId, authHeader) => {
  // Call product-service directly inside docker network
  const { data } = await axios.get(`http://product-service:3001/api/products/${productId}`, {
    headers: authHeader ? { Authorization: authHeader } : undefined
  });
  return data;
};

// Routes

// Get current user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    res.json(cart || { userId: req.user.id, items: [] });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Replace entire cart
app.put('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Optionally validate items against product-service
    const validatedItems = [];
    for (const item of items) {
      const p = await fetchProduct(item.productId);
      if (!p || p.stock <= 0) continue;
      const qty = Math.max(1, Math.min(item.quantity || 1, p.stock));
      validatedItems.push({
        productId: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        quantity: qty,
        sellerId: p.sellerId,
        sellerName: p.sellerName
      });
    }

    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: validatedItems, updatedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Add item to cart (idempotent increment)
app.post('/api/cart/items', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    const product = await fetchProduct(productId);
    if (!product || product.stock <= 0) {
      return res.status(400).json({ message: 'Product not available' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }) || new Cart({ userId: req.user.id, items: [] });
    const existing = cart.items.find(i => i.productId === product._id);
    const newQty = Math.max(1, Math.min((existing?.quantity || 0) + (quantity || 1), product.stock));

    if (existing) {
      existing.quantity = newQty;
    } else {
      cart.items.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: Math.min(quantity || 1, product.stock),
        sellerId: product.sellerId,
        sellerName: product.sellerName
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Update a cart item's quantity
app.patch('/api/cart/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    if (quantity == null) return res.status(400).json({ message: 'quantity is required' });

    const product = await fetchProduct(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId === product._id);
    if (!item) return res.status(404).json({ message: 'Item not found in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== product._id);
    } else {
      item.quantity = Math.min(quantity, product.stock);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Remove item from cart
app.delete('/api/cart/items/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const existingLength = cart.items.length;
    cart.items = cart.items.filter(i => i.productId !== productId);

    if (cart.items.length === existingLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.json(cart);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Clear cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], updatedAt: Date.now() },
      { new: true }
    );

    res.json(cart || { userId: req.user.id, items: [] });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'cart-service' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Cart service running on port ${PORT}`);
});
