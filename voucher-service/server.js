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

// Voucher Schema
const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
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
    const userResponse = await axios.get(`${userServiceUrl}/api/users/me`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    req.user = userResponse.data;
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

// Get all vouchers (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const vouchers = await Voucher.find().sort({ createdAt: -1 });
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new voucher (admin only)
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate } = req.body;

    const newVoucher = new Voucher({
      code,
      discountType,
      discountValue,
      expiryDate
    });

    await newVoucher.save();
    res.status(201).json(newVoucher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.use('/api/vouchers', router);

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

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Voucher service running on port ${PORT}`);
});
