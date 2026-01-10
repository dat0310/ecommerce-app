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

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sellerId: {
    type: String,
    required: true
  },
  sellerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

// Middleware to verify JWT token and normalize req.user
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: { message: 'Access denied. No token provided.' } });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Normalize shape: ensure id, email, role
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

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

// Routes

// Get all approved products (public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ 
      status: 'approved', 
      isActive: true 
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's products
app.get('/api/products/seller/my-products', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Test endpoint without authentication
app.get('/api/products/test-pending', async (req, res) => {
  try {
    console.log('Getting pending products (test endpoint)...');
    const products = await Product.find({ status: 'pending' }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} pending products`);
    res.json(products);
  } catch (error) {
    console.error('Error getting pending products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all pending products (admin only)
app.get('/api/products/pending', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    console.log('Getting pending products...');
    const products = await Product.find({ status: 'pending' }).sort({ createdAt: -1 });
    console.log(`Found ${products.length} pending products`);
    res.json(products);
  } catch (error) {
    console.error('Error getting pending products:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all products (admin only)
app.get('/api/products/admin/all', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID (public) - This must be LAST to avoid conflicts with specific routes
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Only show approved products to public
    if (product.status !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new product (sellers only)
app.post('/api/products', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    // Get seller name from user service
    let sellerName = req.user.email.split('@')[0]; // fallback
    try {
      const userResponse = await axios.get(`http://user-service:3002/api/users/${req.user.id}`, {
        headers: { 'Authorization': `Bearer ${req.header('Authorization')?.replace('Bearer ', '')}` }
      });
      if (userResponse.data && userResponse.data.firstName && userResponse.data.lastName) {
        sellerName = `${userResponse.data.firstName} ${userResponse.data.lastName}`;
      }
    } catch (userError) {
      console.log('Could not fetch user details, using email prefix as fallback');
    }
    
    const productData = {
      ...req.body,
      sellerId: req.user.id,
      sellerName: sellerName,
      status: 'pending',
      updatedAt: Date.now()
    };
    
    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Partial update product (seller who owns it or admin)
app.patch('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check if user can update this product
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
      return res.status(403).json({ error: { message: 'Access denied. You can only update your own products.' } });
    }

    req.body.updatedAt = Date.now();
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { 
      new: true,
      runValidators: true 
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Delete product (seller who owns it or admin)
app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check if user can delete this product
    if (req.user.role !== 'admin' && product.sellerId !== req.user.id) {
      return res.status(403).json({ error: { message: 'Access denied. You can only delete your own products.' } });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Approve/reject product (admin only)
app.patch('/api/products/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status specified.' } });
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    res.json({
      message: `Product ${status} successfully`,
      product
    });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Product service running on port ${PORT}`);
});