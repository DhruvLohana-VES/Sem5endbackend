// middleware/role.middleware.js

/**
 * Role-based authorization middleware for MediCare platform
 * 
 * This middleware protects routes by checking if the authenticated user
 * has one of the required roles.
 * 
 * @param {...string} roles - Allowed roles (e.g., 'patient', 'caretaker', 'donor', 'admin')
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Single role
 * router.get('/admin/users', protect, authorizeRoles('admin'), getAllUsers);
 * 
 * // Multiple roles
 * router.get('/notifications', protect, authorizeRoles('patient', 'caretaker'), getNotifications);
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
