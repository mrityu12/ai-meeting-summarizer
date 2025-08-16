const express = require('express');
const multer = require('multer');  // ❗ जरूरी है multer errors handle करने के लिए
const router = express.Router();

const upload = require('../middleware/upload');
const { 
    generateSummary, 
    shareSummary, 
    healthCheck 
} = require('../controllers/summaryController');

// Health check endpoint
router.get('/health', healthCheck);

// Generate summary endpoint
// Accepts either file upload or direct text input
router.post('/generate-summary', upload.single('transcript'), generateSummary);

// Share summary via email endpoint
router.post('/share-summary', shareSummary);

// Error handling for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum size is 5MB.' 
            });
        }
        return res.status(400).json({ 
            error: `Upload error: ${error.message}` 
        });
    } else if (error) {
        return res.status(400).json({ 
            error: error.message 
        });
    }
    next();
});

module.exports = router;
