const jwt = require('jsonwebtoken');

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

module.exports = { authenticateToken };
