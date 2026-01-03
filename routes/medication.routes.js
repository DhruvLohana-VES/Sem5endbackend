const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const medicationController = require('../controllers/medication.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

// Validation
const medicationValidation = [
  body('patientId').notEmpty().withMessage('Patient ID is required'),
  body('name').trim().notEmpty().withMessage('Medication name is required'),
  body('dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('frequency').trim().notEmpty().withMessage('Frequency is required'),
  body('timing').isArray({ min: 1 }).withMessage('At least one timing is required'),
  validate
];

// Routes
router.post('/', protect, authorize('caretaker'), medicationValidation, medicationController.createMedication);
router.get('/', protect, authorize('patient'), medicationController.getAllMedications);
router.get('/patient/:patientId', protect, medicationController.getMedicationsByPatient);
router.patch('/:id', protect, authorize('caretaker'), medicationController.updateMedication);
router.delete('/:id', protect, authorize('caretaker'), medicationController.deleteMedication);

module.exports = router;
