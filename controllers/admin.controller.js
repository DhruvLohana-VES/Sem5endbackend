// controllers/admin.controller.js

const supabase = require('../config/supabase');

/**
 * @desc    Get all users with pagination and role filtering
 * @route   GET /api/admin/users
 * @access  Admin only
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users')
      .select('id, name, email, role, phone, age, gender, blood_group, city, status, created_at, updated_at', { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add role filter if provided
    if (role) {
      query = query.eq('role', role);
    }

    const { data: users, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

/**
 * @desc    Enable or disable a user account
 * @route   PATCH /api/admin/users/:id/status
 * @access  Admin only
 */
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    // Prevent admin from disabling themselves
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own status'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

/**
 * @desc    Get system-wide analytics and statistics
 * @route   GET /api/admin/analytics
 * @access  Admin only
 */
exports.getSystemAnalytics = async (req, res) => {
  try {
    // Get total users by role
    const { data: userStats, error: userError } = await supabase
      .from('users')
      .select('role', { count: 'exact' });

    if (userError) throw userError;

    // Count users by role
    const roleCounts = userStats.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Get total medications
    const { count: totalMedications, error: medError } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true });

    if (medError) throw medError;

    // Get total donations
    const { count: totalDonations, error: donError } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true });

    if (donError) throw donError;

    // Get total doses
    const { count: totalDoses, error: doseError } = await supabase
      .from('doses')
      .select('*', { count: 'exact', head: true });

    if (doseError) throw doseError;

    // Get total links
    const { count: totalLinks, error: linkError } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true });

    if (linkError) throw linkError;

    res.json({
      success: true,
      data: {
        users: {
          total: userStats.length,
          byRole: {
            patient: roleCounts.patient || 0,
            caretaker: roleCounts.caretaker || 0,
            donor: roleCounts.donor || 0,
            admin: roleCounts.admin || 0
          }
        },
        medications: totalMedications || 0,
        donations: totalDonations || 0,
        doses: totalDoses || 0,
        caretakerPatientLinks: totalLinks || 0
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Get all caretaker-patient links
 * @route   GET /api/admin/links
 * @access  Admin only
 */
exports.getAllLinks = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: links, error, count } = await supabase
      .from('links')
      .select(`
        id,
        caretaker_id,
        patient_id,
        status,
        created_at,
        caretaker:users!links_caretaker_id_fkey(id, name, email),
        patient:users!links_patient_id_fkey(id, name, email)
      `, { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: links,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all links error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching links',
      error: error.message
    });
  }
};

/**
 * @desc    Get recent system activity
 * @route   GET /api/admin/activity
 * @access  Admin only
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = 20;

    // Get recent users
    const { data: recentUsers, error: userError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userError) throw userError;

    // Get recent medications
    const { data: recentMeds, error: medError } = await supabase
      .from('medications')
      .select('id, name, created_at, patient_id, users(name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (medError) throw medError;

    // Get recent doses
    const { data: recentDoses, error: doseError } = await supabase
      .from('doses')
      .select('id, status, scheduled_time, taken_time, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit);

    if (doseError) throw doseError;

    // Combine and sort all activities
    const activities = [
      ...recentUsers.map(u => ({
        type: 'user_created',
        timestamp: u.created_at,
        data: { name: u.name, email: u.email, role: u.role }
      })),
      ...recentMeds.map(m => ({
        type: 'medication_created',
        timestamp: m.created_at,
        data: { medication: m.name, patient: m.users?.name }
      })),
      ...recentDoses.map(d => ({
        type: 'dose_updated',
        timestamp: d.updated_at,
        data: { status: d.status, scheduled: d.scheduled_time }
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};
