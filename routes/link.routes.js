const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const linkController = require('../controllers/link.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// Validation
const inviteValidation = [
  body('patientEmail').isEmail().withMessage('Valid patient email is required'),
  validate
];

// Routes
router.post('/invite', protect, authorize('caretaker'), inviteValidation, linkController.sendInvitation);
router.get('/pending', protect, authorize('patient'), linkController.getPendingInvitations);
router.post('/:id/accept', protect, authorize('patient'), linkController.acceptInvitation);
router.delete('/:patientId', protect, authorize('caretaker'), linkController.unlinkPatient);

module.exports = router;
