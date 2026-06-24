const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            return next(); // Explicit return taake execution agay chali jaye
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' }); // Added return
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' }); // Added explicit return here!
    }
};

module.exports = { protect };