const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Get all patients (caretaker only)
router.get('/', protect, authorize('caretaker'), patientController.getAllPatients);

// Get patient by ID
router.get('/:id', protect, patientController.getPatientById);

module.exports = router;
