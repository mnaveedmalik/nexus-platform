const express = require('express');
const { getUsersByRole, getUserById } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Role based dashboards fetching (Protected via JWT)
router.get('/role/:roleType', protect, getUsersByRole);
router.get('/:id', protect, getUserById);

module.exports = router;