// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const mySecretKey = 'zubair_farooq';

const authenticateUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ message: 'Authorization token required' });
    }

    try {
        const decoded = jwt.verify(token, mySecretKey);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateUser;
