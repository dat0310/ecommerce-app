const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

module.exports = {
    authenticateToken,
    requireRole
};
