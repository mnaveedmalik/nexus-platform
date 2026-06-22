const Document = require('../models/Document');

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const doc = await Document.create({
            fileName: req.file.originalname,
            filePath: req.file.path,
            uploadedBy: req.user.id
        });
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signDocument = async (req, res) => {
    const { signatureImage } = req.body; // Expecting base64 string of signature
    try {
        const doc = await Document.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'Document not found' });

        doc.signatureImage = signatureImage;
        doc.status = 'Signed';
        await doc.save();

        res.json({ message: 'Document signed successfully!', doc });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const docs = await Document.find({ uploadedBy: req.user.id });
        res.json(docs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadDocument, signDocument, getMyDocuments };