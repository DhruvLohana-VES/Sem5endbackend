const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect } = require('../middleware/auth.middleware');

// Routes
router.get('/adherence/:patientId', protect, reportController.getAdherenceReport);

module.exports = router;
