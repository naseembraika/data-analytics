const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { ensureAuthenticated } = require('../middleware/auth');
const multer = require('multer');

// Configure multer upload for handling errors
const upload = multer({ 
    storage: documentController.storage, // Use storage from controller
    fileFilter: documentController.fileFilter // Use fileFilter from controller
}).single('document');

// Document routes
router.get('/', ensureAuthenticated, documentController.getAllDocuments);
router.get('/upload', ensureAuthenticated, documentController.getUploadPage);

// Handle document upload with Multer error handling
router.post('/upload', ensureAuthenticated, (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            req.flash('error_msg', err.message);
            return res.redirect('/documents/upload');
        } else if (err) {
            // An unknown error occurred when uploading.
            req.flash('error_msg', err.message || 'An unknown error occurred during upload.');
            return res.redirect('/documents/upload');
        }
        // Everything went fine, proceed to documentController.uploadDocument
        next();
    });
}, documentController.uploadDocument);

router.get('/search', ensureAuthenticated, documentController.searchDocuments);
router.get('/classify', ensureAuthenticated, documentController.classifyDocuments);
router.get('/statistics', ensureAuthenticated, documentController.getStatistics);
router.get('/:id', ensureAuthenticated, documentController.getDocumentById);

module.exports = router; 