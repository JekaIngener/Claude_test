const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');

// Generate PDF with form fields
router.post('/generate', pdfController.generatePDF);

module.exports = router;
