const Transaction = require('../models/Transaction');

const processPayment = async (req, res) => {
    const { type, amount } = req.body;
    try {
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const tx = await Transaction.create({
            user: req.user.id,
            type,
            amount,
            status: 'Completed' // Mocking instantaneous sandbox completion
        });

        res.status(201).json({ message: 'Transaction processed successfully!', tx });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTransactionHistory = async (req, res) => {
    try {
        const history = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { processPayment, getTransactionHistory };