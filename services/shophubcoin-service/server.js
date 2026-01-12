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

// Coin Schema
const coinSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  lastDailyClaim: {
    type: Date,
    default: null
  },
  transactions: [
    {
      type: { type: String, enum: ['EARN', 'SPEND'] },
      amount: Number,
      description: String,
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CoinWallet = mongoose.model('CoinWallet', coinSchema);

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // we just need the id from the token
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

// Routes

// Get coin balance
app.get('/', authenticateToken, async (req, res) => {
  try {
    let wallet = await CoinWallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new CoinWallet({ userId: req.user.id });
      await wallet.save();
    }

    // Check if daily claimed today
    let dailyClaimed = false;
    if (wallet.lastDailyClaim) {
      const last = new Date(wallet.lastDailyClaim);
      const now = new Date();
      if (last.toDateString() === now.toDateString()) {
        dailyClaimed = true;
      }
    }

    res.json({
      coins: wallet.balance,
      dailyClaimed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Claim daily coins
app.post('/claim-daily', authenticateToken, async (req, res) => {
  try {
    let wallet = await CoinWallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new CoinWallet({ userId: req.user.id });
    }

    // Check if already claimed today
    if (wallet.lastDailyClaim) {
      const last = new Date(wallet.lastDailyClaim);
      const now = new Date();
      if (last.toDateString() === now.toDateString()) {
        return res.status(400).json({ message: 'Already claimed daily coins today.' });
      }
    }

    const DAILY_REWARD = 100;

    wallet.balance += DAILY_REWARD;
    wallet.lastDailyClaim = new Date();
    wallet.transactions.push({
      type: 'EARN',
      amount: DAILY_REWARD,
      description: 'Daily Login Reward'
    });

    await wallet.save();

    res.json({
      message: 'Daily coins claimed successfully!',
      coins: wallet.balance,
      dailyClaimed: true
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`ShopHubCoin Service running on port ${PORT}`);
});
