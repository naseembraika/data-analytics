const Document = require('../models/Document');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const mongoose = require('mongoose');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = function (req, file, cb) {
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only PDF, DOC, and DOCX files are allowed!');
    }
};

// Extract text from different file types
async function extractText(filePath, fileType) {
    try {
        if (fileType === 'pdf') {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } else if (fileType === 'docx' || fileType === 'doc') {
            const result = await mammoth.extractRawText({ path: filePath });
            return result.value;
        }
        return '';
    } catch (error) {
        console.error('Error extracting text:', error);
        return '';
    }
}

// Document Controller Methods
const documentController = {
    storage: storage, // Export storage
    fileFilter: fileFilter, // Export fileFilter

    // Get upload page
    getUploadPage: async (req, res) => {
        try {
            // Temporary test flash message
            // req.flash('success_msg', 'Test message from getUploadPage!'); 

            const recentDocuments = await Document.find({ user: req.user.id })
                .sort({ date: -1 })
                .limit(5);
            res.render('documents/upload', {
                title: 'Upload Document',
                recentDocuments
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error loading recent documents');
            res.render('documents/upload', {
                title: 'Upload Document',
                recentDocuments: []
            });
        }
    },

    // Upload document
    uploadDocument: async (req, res) => {
        try {
            if (!req.file) {
                req.flash('error_msg', 'Please select a file to upload');
                return res.redirect('/documents/upload');
            }

            const fileExtension = path.extname(req.file.originalname).toLowerCase();
            let fileTypeForExtraction;

            if (fileExtension === '.pdf') {
                fileTypeForExtraction = 'pdf';
            } else if (fileExtension === '.docx' || fileExtension === '.doc') {
                fileTypeForExtraction = 'docx'; // mammoth handles both doc and docx for raw text
            } else {
                // Handle unsupported file types if necessary, though Multer should filter them
                fileTypeForExtraction = '';
            }

            const extractedContent = await extractText(req.file.path, fileTypeForExtraction);

            const newDocument = new Document({
                name: req.file.originalname,
                path: req.file.path,
                type: req.file.mimetype,
                size: req.file.size,
                content: extractedContent, // Save extracted content
                user: req.user.id
            });

            await newDocument.save();
            req.flash('success_msg', 'Document uploaded successfully');
            res.redirect('/documents/upload');
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error uploading document');
            res.redirect('/documents/upload');
        }
    },

    // Get all documents
    getAllDocuments: async (req, res) => {
        try {
            const documents = await Document.find({ user: req.user.id });
            res.render('documents/index', {
                title: 'My Documents',
                documents
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error fetching documents');
            res.redirect('/dashboard');
        }
    },

    // Search documents
    searchDocuments: async (req, res) => {
        try {
            const { query } = req.query;
            const documents = await Document.find({
                user: req.user.id,
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { content: { $regex: query, $options: 'i' } }
                ]
            });
            res.render('documents/search', {
                title: 'Search Results',
                documents,
                query
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error searching documents');
            res.redirect('/documents');
        }
    },

    // Classify documents
    classifyDocuments: async (req, res) => {
        try {
            const documents = await Document.find({ user: req.user.id });
            res.render('documents/classify', {
                title: 'Classify Documents',
                documents
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error classifying documents');
            res.redirect('/documents');
        }
    },

    // Get single document by ID
    getDocumentById: async (req, res) => {
        try {
            const document = await Document.findById(req.params.id);
            const searchQuery = req.query.query || ''; // Get search query from URL

            if (!document || String(document.user) !== String(req.user.id)) {
                req.flash('error_msg', 'Document not found or unauthorized');
                return res.redirect('/documents');
            }
            res.render('documents/view', {
                title: document.name,
                document,
                searchQuery // Pass search query to the view
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error retrieving document');
            res.redirect('/documents');
        }
    },

    // Get statistics
    getStatistics: async (req, res) => {
        try {
            const totalDocuments = await Document.countDocuments({ user: req.user.id });
            const totalSize = await Document.aggregate([
                { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
                { $group: { _id: null, total: { $sum: '$size' } } }
            ]);

            res.render('documents/statistics', {
                title: 'Document Statistics',
                totalDocuments,
                totalSize: totalSize[0]?.total || 0
            });
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Error fetching statistics');
            res.redirect('/documents');
        }
    }
};

module.exports = documentController; 