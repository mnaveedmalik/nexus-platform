const Transaction = require('../models/Transaction');

// @desc    Process a standalone sandbox transaction
// @route   POST /api/payments
const processPayment = async (req, res) => {
    // Safe destructuring using fallback to prevent undefined object errors
    const { type, amount } = req.body || {};
    try {
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount or payload provided' });
        }
        if (!type) {
            return res.status(400).json({ message: 'Transaction type is strictly required' });
        }

        // Creating dynamic transaction mapping strictly aligning with model schema
        const tx = await Transaction.create({
            user: req.user.id, // Logged in Investor reference mapping
            type: type,
            amount: amount,
            status: 'Completed' // Mocking instantaneous sandbox completion
        });

        return res.status(201).json({ message: 'Transaction processed successfully!', tx });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get complete payment ledger records for current user
// @route   GET /api/payments
const getTransactionHistory = async (req, res) => {
    try {
        const history = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        return res.json(history);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { processPayment, getTransactionHistory };