const express = require('express');
const { uploadDocument, signDocument, getMyDocuments } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Chain structures ko mita kar explicit and direct standard operations
router.post('/', protect, upload.single('document'), uploadDocument);
router.get('/', protect, getMyDocuments);
router.put('/:id/sign', protect, signDocument);

module.exports = router;