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
  getRecentActivity
} = require('../controllers/admin.controller');

/**
 * Admin Routes for MediCare Platform
 * 
 * All routes require:
 * 1. JWT authentication (protect middleware)
 * 2. Admin role (authorizeRoles('admin') middleware)
 */

// @route   GET /api/admin/users
// @desc    Get all users with pagination and role filtering
// @access  Admin only
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

// @route   PATCH /api/admin/users/:id/status
// @desc    Enable or disable a user account
// @access  Admin only
router.patch('/users/:id/status', protect, authorizeRoles('admin'), updateUserStatus);

// @route   GET /api/admin/analytics
// @desc    Get system-wide statistics and analytics
// @access  Admin only
router.get('/analytics', protect, authorizeRoles('admin'), getSystemAnalytics);

// @route   GET /api/admin/links
// @desc    Get all caretaker-patient links with user details
// @access  Admin only
router.get('/links', protect, authorizeRoles('admin'), getAllLinks);

// @route   GET /api/admin/activity
// @desc    Get recent system activity (last 20 actions)
// @access  Admin only
router.get('/activity', protect, authorizeRoles('admin'), getRecentActivity);

module.exports = router;
