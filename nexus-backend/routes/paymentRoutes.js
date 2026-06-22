const express = require('express');
const { processPayment, getTransactionHistory } = require('../controllers/paymentController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/').post(protect, processPayment).get(protect, getTransactionHistory);

module.exports = router;