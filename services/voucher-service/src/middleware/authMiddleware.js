const jwt = require('jsonwebtoken');
const axios = require('axios');

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
