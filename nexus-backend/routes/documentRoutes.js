const express = require('express');
const { uploadDocument, signDocument, getMyDocuments } = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.route('/').post(protect, upload.single('document'), uploadDocument).get(protect, getMyDocuments);
router.route('/:id/sign').put(protect, signDocument);

module.exports = router;