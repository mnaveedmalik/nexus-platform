const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true,
        // Yahan humne sab lowercase aur uppercase combinations allow kar diye hain
        enum: ['credit', 'debit', 'payment', 'transfer', 'Investment', 'Credit', 'Debit']
    },
    status: {
        type: String,
        default: 'Completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Transaction', transactionSchema);