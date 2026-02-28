const jwt = require('jsonwebtoken');

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

module.exports = { authenticateToken };
