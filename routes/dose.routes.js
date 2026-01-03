const express = require('express');
const router = express.Router();
const doseController = require('../controllers/dose.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes
router.get('/today', protect, authorize('patient'), doseController.getTodayDoses);
router.get('/history', protect, authorize('patient'), doseController.getDoseHistory);
router.patch('/:id/take', protect, authorize('patient'), doseController.markAsTaken);
router.patch('/:id/miss', protect, authorize('patient'), doseController.markAsMissed);

module.exports = router;
