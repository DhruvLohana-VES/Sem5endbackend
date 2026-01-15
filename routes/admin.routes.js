// routes/admin.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const authorizeRoles = require('../middleware/role.middleware');
const {
  getAllUsers,
  updateUserStatus,
  getSystemAnalytics,
  getAllLinks,
  getRecentActivity,
  getAllPatients,
  getPatientById,
  updatePatient,
  getPatientMedications,
  getPatientAdherence,
  getAllCaretakers,
  getCaretakerById,
  assignPatientToCaretaker,
  removePatientCaretakerLink
} = require('../controllers/admin.controller');

/**
 * Admin Routes for MediCare Platform
 * 
 * All routes require:
 * 1. JWT authentication (protect middleware)
 * 2. Admin role (authorizeRoles('admin') middleware)
 */

// ============================================
// USER MANAGEMENT
// ============================================

// @route   GET /api/admin/users
// @desc    Get all users with pagination and role filtering
// @access  Admin only
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

// @route   PATCH /api/admin/users/:id/status
// @desc    Enable or disable a user account
// @access  Admin only
router.patch('/users/:id/status', protect, authorizeRoles('admin'), updateUserStatus);

// ============================================
// ANALYTICS & ACTIVITY
// ============================================

// @route   GET /api/admin/analytics
// @desc    Get system-wide statistics and analytics
// @access  Admin only
router.get('/analytics', protect, authorizeRoles('admin'), getSystemAnalytics);

// @route   GET /api/admin/activity
// @desc    Get recent system activity (last 20 actions)
// @access  Admin only
router.get('/activity', protect, authorizeRoles('admin'), getRecentActivity);

// ============================================
// PATIENT MANAGEMENT
// ============================================

// @route   GET /api/admin/patients
// @desc    Get all patients with pagination and search
// @access  Admin only
router.get('/patients', protect, authorizeRoles('admin'), getAllPatients);

// @route   GET /api/admin/patients/:id
// @desc    Get full patient profile with stats
// @access  Admin only
router.get('/patients/:id', protect, authorizeRoles('admin'), getPatientById);

// @route   PATCH /api/admin/patients/:id
// @desc    Update patient basic details
// @access  Admin only
router.patch('/patients/:id', protect, authorizeRoles('admin'), updatePatient);

// @route   GET /api/admin/patients/:id/medications
// @desc    Get all medications for a patient
// @access  Admin only
router.get('/patients/:id/medications', protect, authorizeRoles('admin'), getPatientMedications);

// @route   GET /api/admin/patients/:id/adherence
// @desc    Get patient adherence statistics
// @access  Admin only
router.get('/patients/:id/adherence', protect, authorizeRoles('admin'), getPatientAdherence);

// ============================================
// CARETAKER MANAGEMENT
// ============================================

// @route   GET /api/admin/caretakers
// @desc    Get all caretakers with patient counts
// @access  Admin only
router.get('/caretakers', protect, authorizeRoles('admin'), getAllCaretakers);

// @route   GET /api/admin/caretakers/:id
// @desc    Get caretaker details with assigned patients
// @access  Admin only
router.get('/caretakers/:id', protect, authorizeRoles('admin'), getCaretakerById);

// ============================================
// LINK MANAGEMENT (Patient-Caretaker)
// ============================================

// @route   GET /api/admin/links
// @desc    Get all caretaker-patient links with user details
// @access  Admin only
router.get('/links', protect, authorizeRoles('admin'), getAllLinks);

// @route   POST /api/admin/links
// @desc    Assign patient to caretaker (create link)
// @access  Admin only
router.post('/links', protect, authorizeRoles('admin'), assignPatientToCaretaker);

// @route   DELETE /api/admin/links/:linkId
// @desc    Remove patient-caretaker link
// @access  Admin only
router.delete('/links/:linkId', protect, authorizeRoles('admin'), removePatientCaretakerLink);

module.exports = router;
