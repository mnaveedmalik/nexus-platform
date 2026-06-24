const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Absolute path generated using path.join to avoid ENOENT crashes
const uploadDir = path.join(__dirname, '../uploads');

// Agar folder physically na bana ho, toh code khud bana dega
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, uploadDir); // Pointing strictly to our secure absolute directory
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });
module.exports = upload;