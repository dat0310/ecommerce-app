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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Voucher Schema
const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    default: ''
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: null
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageCount: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Voucher = mongoose.model('Voucher', voucherSchema);

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
      req.user = userResponse.data;
      next();
    } catch (apiError) {
      console.error('Error contacting user service:', apiError.message);
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

    // Role check logic
    // Ensure req.user.role exists and is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Routes
const router = express.Router();

// Get all vouchers (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active vouchers (public/user)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const vouchers = await Voucher.find({
      isActive: true,
      expiryDate: { $gt: now },
      $expr: {
        $or: [
          { $eq: ["$usageLimit", null] },
          { $lt: ["$usageCount", "$usageLimit"] }
        ]
      }
    }).select('-usageCount -usageLimit'); // Hide internal usage stats if preferred
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new voucher (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiryDate
    } = req.body;

    const existingVoucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (existingVoucher) {
      return res.status(400).json({ message: 'Voucher code already exists.' });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      usageLimit,
      expiryDate
    });

    await newVoucher.save();
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update voucher (admin only)
router.patch('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json(voucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete voucher (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });
    res.json({ message: 'Voucher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Apply voucher (User interaction)
// Note: This only validates and returns the discount info. Actual usage increment should happen on order placement.
// Or we can increment temporarily? Usually 'Apply' just checks validity. 'Redeem' happens at order.
// Since order service uses the voucher code, we'll need a way to increment usage eventually.
// For now, let's keep 'apply' as a check method.
router.post('/apply', authenticateToken, async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Voucher code is required.' });
    }

    const voucher = await Voucher.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!voucher) {
      return res.status(404).json({ message: 'Invalid voucher code.' });
    }

    // Check expiry
    if (new Date() > voucher.expiryDate) {
      return res.status(400).json({ message: 'Voucher has expired.' });
    }

    // Check usage limit
    if (voucher.usageLimit !== null && voucher.usageCount >= voucher.usageLimit) {
      return res.status(400).json({ message: 'Voucher usage limit reached.' });
    }

    // Check min order value
    if (orderTotal !== undefined && orderTotal < voucher.minOrderValue) {
      return res.status(400).json({
        message: `Order total must be at least $${voucher.minOrderValue} to use this voucher.`
      });
    }

    res.json({
      message: 'Voucher applied successfully',
      voucher: {
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        minOrderValue: voucher.minOrderValue,
        maxDiscount: voucher.maxDiscount
      }
    });
  } catch (error) {
    console.error('Error applying voucher:', error);
    res.status(500).json({ message: 'Failed to apply voucher.' });
  }
});

// Increment Usage (Internal or Admin or Order Service callback)
// Ideally, the order service should call this when an order is placed.
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;

    // We might want to restrict this to internal services only (via secret header or checking IP), 
    // but for now, authenticated token is okay if we trust the caller.
    // Ideally, we'd check if the user is 'system' or 'admin', or use a service-to-service key.

    const voucher = await Voucher.findOne({ code: code.toUpperCase() });
    if (!voucher) return res.status(404).json({ message: 'Voucher not found' });

    voucher.usageCount += 1;
    await voucher.save();

    res.json({ message: 'Voucher redeemed successfully', usageCount: voucher.usageCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get vouchers statistics (admin only)
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalVouchers = await Voucher.countDocuments();
    const activeVouchers = await Voucher.countDocuments({ isActive: true });
    const expiredVouchers = await Voucher.countDocuments({ expiryDate: { $lt: new Date() } });

    res.json({
      totalVouchers,
      activeVouchers,
      expiredVouchers
    });
  } catch (error) {
    console.error('Error loading voucher stats:', error);
    res.status(500).json({ message: error.message });
  }
});

app.use('/api/vouchers', router);

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Voucher service running on port ${PORT}`);
});
