const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // To communicate with other services
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User Schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'seller'],
    default: 'customer'
  },
  addresses: [
    {
      fullName: String,
      phoneNumber: String,
      cityDistrictWard: String,
      streetBuildingHouse: String,
      isDefault: {
        type: Boolean,
        default: false
      }
    }
  ],
  refreshToken: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' } // Default to 24 hours if not set
  );
};

// Generate refresh token method
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign(
    {
      id: this._id,
      email: this.email
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: '7d' } // Refresh tokens last 7 days
  );
};

const User = mongoose.model('User', userSchema);

// Middleware to verify JWT token and normalize req.user
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: { message: 'Access denied. No token provided.' } });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ error: { message: 'Token is not valid.' } });

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      profile: user // keep profile available if needed
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

// Register a new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Validate role if provided
    const validRoles = ['customer', 'admin', 'seller'];
    const userRole = role && validRoles.includes(role) ? role : 'customer';

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: userRole
    });

    await user.save();

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User registered successfully',
      token,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated.' });
    }

    // Generate tokens
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token to user
    user.refreshToken = refreshToken;
    await user.save();

    // Return user data without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      addresses: user.addresses,
      avatar: user.avatar,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile (me)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    // return normalized profile
    const profile = req.user.profile || { id: req.user.id, email: req.user.email, role: req.user.role };
    res.json({ id: req.user.id, email: req.user.email, role: req.user.role, profile });
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Partial update current user profile (me)
app.patch('/api/users/me', authenticateToken, async (req, res) => {
  try {
    // Don't allow password update through this route
    if (req.body.password) delete req.body.password;

    req.body.updatedAt = Date.now();
    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (admin only)
app.get('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: { message: error.message } });
  }
});

// Partial update user by ID (admin only)
app.patch('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    if (req.body.password) delete req.body.password;
    req.body.updatedAt = Date.now();
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ error: { message: 'User not found' } });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Delete user by ID (admin only)
app.delete('/api/users/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password
app.put('/api/users/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(400).json({ error: { message: error.message } });
  }
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: { message: err.message || 'Internal server error' } });
});

// Add address
app.post('/api/users/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // If this is the first address, set it as default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }
    
    // If setting this address as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    user.addresses.push(req.body);
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update address
app.put('/api/users/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    // If setting this address as default, remove default from others
    if (req.body.isDefault) {
      user.addresses.forEach(address => {
        address.isDefault = false;
      });
    }
    
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex].toObject(),
      ...req.body
    };
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete address
app.delete('/api/users/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );
    
    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }
    
    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);
    
    // If we deleted the default address and there are other addresses, set the first one as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    user.updatedAt = Date.now();
    await user.save();
    
    res.json({
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's orders ("My Purchase")
app.get('/api/users/me/orders', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user.id);
    // The order service URL should be in your .env file
    const orderServiceUrl = process.env.ORDER_SERVICE_URL;
    if (!orderServiceUrl) {
      console.error('ORDER_SERVICE_URL is not defined in the environment variables.');
      return res.status(500).json({ message: 'Service configuration error.' });
    }

    // Forward the request to the order service to get orders for the current user.
    // We pass the authorization header to allow the order service to authenticate the user.
    const response = await axios.get(`${orderServiceUrl}/api/orders/user/${req.user.id}`, {
      headers: {
        'Authorization': req.header('Authorization')
      }
    });

    console.log('Orders fetched successfully for user:', req.user.id);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching orders for user:', req.user.id, error.message);
    res.status(error.response?.status || 500).json({ message: error.response?.data?.message || 'Error fetching orders.' });
  }
});

// Get users by role (admin only)
app.get('/api/users/role/:role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['customer', 'admin', 'seller'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }
    
    const users = await User.find({ role }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role (admin only)
app.patch('/api/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'admin', 'seller'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        role,
        updatedAt: Date.now()
      },
      { 
        new: true,
        runValidators: true 
      }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Toggle user active status (admin only)
app.patch('/api/users/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: req.body.isActive,
        updatedAt: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Refresh token endpoint
app.post('/api/users/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);

    // Find user by ID and check if refresh token matches
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    // Generate new tokens
    const newToken = user.generateAuthToken();
    const newRefreshToken = user.generateRefreshToken();

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token.' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});
