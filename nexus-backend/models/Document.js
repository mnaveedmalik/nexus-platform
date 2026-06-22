const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    filePath: { type: String, required: true }, // Local server file path or Cloud URL
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Draft', 'Signed', 'Approved'], default: 'Draft' },
    signatureImage: { type: String, default: '' } // Base64 or path of signature image
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);