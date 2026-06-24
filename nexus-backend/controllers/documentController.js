const Document = require('../models/Document');

// @desc    Upload a new legal document
// @route   POST /api/documents
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const doc = await Document.create({
            fileName: req.file.originalname,
            filePath: req.file.path,
            uploadedBy: req.user.id
        });

        return res.status(201).json(doc);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Sign a document (Safeguarded against undefined body crashes)
// @route   PUT /api/documents/:id/sign
const signDocument = async (req, res) => {
    try {
        // Safe check: Agar req.body pure tarike se undefined ho toh khali object fallback use karein
        const { signatureImage } = req.body || {};

        const doc = await Document.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Agar Base64 signature image aayi hai toh save karein, nahi toh skip karein
        if (signatureImage) {
            doc.signatureImage = signatureImage;
        }

        doc.status = 'Signed';
        await doc.save();

        return res.json({ message: 'Document signed successfully!', doc });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents associated with the logged-in user
// @route   GET /api/documents
const getMyDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ uploadedBy: req.user.id });
        return res.json(docs);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadDocument, signDocument, getMyDocuments };