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

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connected to MongoDB");
});

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  products: [
    {
      productId: {
        type: String,
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      sellerId: {
        type: String,
        required: true
      },
      sellerName: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        default: 1
      },
      price: {
        type: Number,
        required: true
      },
      image: {
        type: String
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    fullName: String,
    phoneNumber: String,
    cityDistrictWard: String,
    streetBuildingHouse: String,
    isDefault: Boolean
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'paypal', 'stripe', 'cash_on_delivery'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  orderNumber: {
    type: String,
    unique: true
  },
  notes: {
    type: String,
    default: ''
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

// Generate order number
const generateOrderNumber = () => {
  return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const Order = mongoose.model('Order', orderSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Forward to the user service to get user details
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service:3002';
    try {
      const userResponse = await axios.get(`${userServiceUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      // User Service returns { id, email, role, ... }
      req.user = userResponse.data;
      next();
    } catch (apiError) {
      console.error('Error contacting user service:', apiError.message);
      // Fallback if user service is unreachable but token is valid
      return res.status(500).json({ message: 'Error verifying user identity with User Service.' });
    }

  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
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
const router = express.Router();

// 1. Health check (No auth required)
router.get('/health', (req, res) => {
  if (mongoose.connection.readyState === 1) {
    res.json({ status: 'OK', message: 'Order service is running and connected to MongoDB' });
  } else {
    res.status(500).json({ status: 'Error', message: 'Order service is not connected to MongoDB' });
  }
});

// 2. Specific GET Routes (MUST come before /:id)

// Get orders statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get seller's orders
router.get('/seller/my-orders', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    // Current user ID from User Service (req.user.id)
    const sellerId = req.user.id;

    // Find orders containing at least one product from this seller
    const orders = await Order.find({ 'products.sellerId': sellerId }).sort({ createdAt: -1 });

    // Filter the products array in each order to ONLY show this seller's products
    // This improves privacy so sellers don't see other sellers' items in a mixed cart.
    const sellerOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.products = orderObj.products.filter(p => p.sellerId === sellerId);
      return orderObj;
    });

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by user ID (admin or user themselves)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    // Check if user can view these orders
    if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }

    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by status (admin only)
router.get('/status/:status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified.' });
    }

    const orders = await Order.find({ status }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. General Collection Routes

// Get all orders (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order (authenticated users)
router.post('/', authenticateToken, async (req, res) => {
  console.log('Creating a new order...');
  try {
    // Map Stripe 'succeeded' to 'completed' for paymentStatus
    let paymentStatus = req.body.paymentStatus;
    if (paymentStatus === 'succeeded') paymentStatus = 'completed';

    const orderData = {
      ...req.body,
      paymentStatus,
      userId: req.user.id, // User Service uses 'id'
      userEmail: req.user.email,
      orderNumber: generateOrderNumber(),
      updatedAt: Date.now()
    };
    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 4. Parameterized Routes (/:id) - MUST be last for GET

// Get order by ID (admin, seller, or order owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid Order ID format' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const userId = req.user.id;

    // Check permissions
    const isAdmin = req.user.role === 'admin';
    const isOwner = order.userId === userId;
    const isSellerForOrder = req.user.role === 'seller' && order.products.some(p => p.sellerId === userId);

    if (!isAdmin && !isOwner && !isSellerForOrder) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    // If seller, maybe we should filter products?
    // The frontend code expects full order to view details, but let's filter for better security if it is a seller
    if (isSellerForOrder && !isAdmin && !isOwner) {
      const orderObj = order.toObject();
      orderObj.products = orderObj.products.filter(p => p.sellerId === userId);
      return res.json(orderObj);
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an order (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    req.body.updatedAt = Date.now();
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an order (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept an order (seller only)
router.patch('/:id/accept', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If the user is a seller, check if they are associated with this order
    const sellerId = req.user.id;
    const isSellerForOrder = order.products.some(product => product.sellerId === sellerId);
    if (!isSellerForOrder) {
      return res.status(403).json({ message: 'Access denied. You can only accept orders containing your products.' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be accepted.' });
    }

    order.status = 'confirmed';
    order.updatedAt = Date.now();
    await order.save();

    res.json({
      message: 'Order accepted successfully',
      order
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (seller or admin)
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'seller']), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status specified.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If the user is a seller, check if they are associated with this order
    if (req.user.role === 'seller') {
      const sellerId = req.user.id;
      const isSellerForOrder = order.products.some(product => product.sellerId === sellerId);
      if (!isSellerForOrder) {
        return res.status(403).json({ message: 'Access denied. You can only update status for orders containing your products.' });
      }
    }

    order.status = status;
    order.updatedAt = Date.now();
    await order.save();

    res.json({
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status (admin only)
router.patch('/:id/payment-status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    let { paymentStatus } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    if (paymentStatus === 'succeeded') paymentStatus = 'completed';
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ message: 'Invalid payment status specified.' });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus,
        updatedAt: Date.now()
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({
      message: `Payment status updated to ${paymentStatus}`,
      order
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mount orders router under unified /api/orders path
app.use('/api/orders', router);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});