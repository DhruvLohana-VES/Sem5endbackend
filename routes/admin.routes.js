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
  removePatientCaretakerLink,
  getAllDonationRequests,
  createDonationRequest,
  approveDonationRequest,
  rejectDonationRequest,
  getAllDonations,
  findSuitableDonors,
  notifyDonorsAboutRequest,
  getAllDonors,
  getDashboardAnalytics
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

// ============================================
// DONATION REQUEST MANAGEMENT
// ============================================

// @route   GET /api/admin/donation-requests
// @desc    Get all donation requests with filtering
// @access  Admin only
router.get('/donation-requests', protect, authorizeRoles('admin'), getAllDonationRequests);

// @route   POST /api/admin/donation-requests
// @desc    Create a new donation request
// @access  Admin only
router.post('/donation-requests', protect, authorizeRoles('admin'), createDonationRequest);

// @route   POST /api/admin/donation-requests/:id/notify-donors
// @desc    Notify all matching donors about a blood request
// @access  Admin only
router.post('/donation-requests/:id/notify-donors', protect, authorizeRoles('admin'), notifyDonorsAboutRequest);

// @route   PATCH /api/admin/donation-requests/:id/approve
// @desc    Approve a donation request
// @access  Admin only
router.patch('/donation-requests/:id/approve', protect, authorizeRoles('admin'), approveDonationRequest);

// @route   PATCH /api/admin/donation-requests/:id/reject
// @desc    Reject a donation request
// @access  Admin only
router.patch('/donation-requests/:id/reject', protect, authorizeRoles('admin'), rejectDonationRequest);

// @route   GET /api/admin/donation-requests/:id/find-donors
// @desc    Find suitable donors for urgent requests
// @access  Admin only
router.get('/donation-requests/:id/find-donors', protect, authorizeRoles('admin'), findSuitableDonors);

// @route   GET /api/admin/donations
// @desc    Get all donations with details
// @access  Admin only
router.get('/donations', protect, authorizeRoles('admin'), getAllDonations);

// @route   GET /api/admin/donors
// @desc    Get all donors with filtering
// @access  Admin only
router.get('/donors', protect, authorizeRoles('admin'), getAllDonors);

// ============================================
// ENHANCED ANALYTICS
// ============================================

// @route   GET /api/admin/analytics/dashboard
// @desc    Get comprehensive dashboard analytics
// @access  Admin only
router.get('/analytics/dashboard', protect, authorizeRoles('admin'), getDashboardAnalytics);

module.exports = router;
