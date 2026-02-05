const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token method
userSchema.methods.generateAuthToken = function () {
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
userSchema.methods.generateRefreshToken = function () {
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
module.exports = User;
