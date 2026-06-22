const User = require('../models/User');

// @desc    Get all users by role (Investor or Entrepreneur)
// @route   GET /api/users/role/:roleType
const getUsersByRole = async (req, res) => {
    const { roleType } = req.params;
    try {
        // Validation check for correct roles
        if (!['Investor', 'Entrepreneur'].includes(roleType)) {
            return res.status(400).json({ message: 'Invalid role type requested' });
        }

        const users = await User.find({ role: roleType }).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single user profile by ID (Dashboard Viewing)
// @route   GET /api/users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User profile not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUsersByRole, getUserById };