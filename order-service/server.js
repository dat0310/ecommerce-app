const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
    req.user = decoded;
    next();
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

// Get all orders (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID (admin or order owner)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Check if user can view this order
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied. You can only view your own orders.' });
    }
    
    res.json(order);
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

// Get current user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's orders
router.get('/seller/my-orders', authenticateToken, requireRole(['seller']), async (req, res) => {
  try {
    const orders = await Order.find({ 'products.sellerId': req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order (customers only)
router.post('/', authenticateToken, requireRole(['customer']), async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id,
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
    if (req.user.role === 'seller') {
      const isSellerForOrder = order.products.some(product => product.sellerId === req.user.id);
      if (!isSellerForOrder) {
        return res.status(403).json({ message: 'Access denied. You can only accept orders containing your products.' });
      }
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
      const isSellerForOrder = order.products.some(product => product.sellerId === req.user.id);
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
    const { paymentStatus } = req.body;
    const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
    
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
    res.status(500).json({ message: error.message });
  }
});

app.use('/api/orders', router);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});