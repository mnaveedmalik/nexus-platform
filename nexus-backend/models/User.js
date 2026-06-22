const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Investor', 'Entrepreneur'], required: true },
    // Extended Profile Info
    bio: { type: String, default: '' },
    history: { type: String, default: '' }, // Startup history ya Investment history
    preferences: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// Password ko save krne se pehle encrypt (hash) krne ke liye middleware
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Password match krne ke liye method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);