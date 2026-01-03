const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Routes
router.get('/profile', protect, authorize('donor'), donorController.getProfile);
router.patch('/profile', protect, authorize('donor'), donorController.updateProfile);
router.patch('/availability/toggle', protect, authorize('donor'), donorController.toggleAvailability);
router.get('/stats', protect, authorize('donor'), donorController.getStats);
router.get('/requests/active', protect, authorize('donor'), donorController.getActiveRequests);
router.post('/requests/:requestId/accept', protect, authorize('donor'), donorController.acceptRequest);
router.get('/donations', protect, authorize('donor'), donorController.getDonations);
router.get('/donations/recent', protect, authorize('donor'), donorController.getRecentDonations);

module.exports = router;
