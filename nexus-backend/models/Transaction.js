const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Deposit', 'Withdraw', 'Transfer'], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);