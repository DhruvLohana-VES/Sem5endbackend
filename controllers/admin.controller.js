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

// ============================================
// PATIENT MANAGEMENT
// ============================================

/**
 * @desc    Get all patients with pagination
 * @route   GET /api/admin/patients
 * @access  Admin only
 */
exports.getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users')
      .select('id, name, email, phone, age, gender, blood_group, city, status, created_at, updated_at', { count: 'exact' })
      .eq('role', 'patient')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: patients, error, count } = await query;

    if (error) throw error;

    // Get caretaker count for each patient
    const patientsWithLinks = await Promise.all(
      patients.map(async (patient) => {
        const { count: caretakerCount } = await supabase
          .from('links')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id)
          .eq('status', 'active');

        return {
          ...patient,
          caretakerCount: caretakerCount || 0
        };
      })
    );

    res.json({
      success: true,
      data: patientsWithLinks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patients',
      error: error.message
    });
  }
};

/**
 * @desc    Get full patient profile by ID
 * @route   GET /api/admin/patients/:id
 * @access  Admin only
 */
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'patient')
      .single();

    if (patientError) throw patientError;

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get assigned caretakers
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select(`
        id,
        status,
        created_at,
        caretaker:users!links_caretaker_id_fkey(id, name, email, phone)
      `)
      .eq('patient_id', id);

    if (linksError) throw linksError;

    // Get medication count
    const { count: medicationCount, error: medCountError } = await supabase
      .from('medications')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', id);

    if (medCountError) throw medCountError;

    // Get total doses
    const { count: totalDoses, error: doseCountError } = await supabase
      .from('doses')
      .select('*', { count: 'exact', head: true })
      .eq('patient_id', id);

    if (doseCountError) throw doseCountError;

    // Remove password from response
    delete patient.password;

    res.json({
      success: true,
      data: {
        ...patient,
        caretakers: links || [],
        stats: {
          medications: medicationCount || 0,
          totalDoses: totalDoses || 0,
          activeCaretakers: links?.filter(l => l.status === 'active').length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get patient by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient details',
      error: error.message
    });
  }
};

/**
 * @desc    Update patient basic details
 * @route   PATCH /api/admin/patients/:id
 * @access  Admin only
 */
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, age, gender, blood_group, city } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (age !== undefined) updateData.age = age;
    if (gender !== undefined) updateData.gender = gender;
    if (blood_group !== undefined) updateData.blood_group = blood_group;
    if (city !== undefined) updateData.city = city;
    updateData.updated_at = new Date().toISOString();

    // Verify patient exists and is a patient
    const { data: existingPatient, error: checkError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', id)
      .single();

    if (checkError || !existingPatient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (existingPatient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'User is not a patient'
      });
    }

    // Update patient
    const { data: patient, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Remove password from response
    delete patient.password;

    res.json({
      success: true,
      message: 'Patient updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating patient',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient medications
 * @route   GET /api/admin/patients/:id/medications
 * @access  Admin only
 */
exports.getPatientMedications = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', id)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get all medications for this patient
    const { data: medications, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name
        },
        medications: medications || []
      }
    });
  } catch (error) {
    console.error('Get patient medications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient medications',
      error: error.message
    });
  }
};

/**
 * @desc    Get patient adherence statistics
 * @route   GET /api/admin/patients/:id/adherence
 * @access  Admin only
 */
exports.getPatientAdherence = async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', id)
      .eq('role', 'patient')
      .single();

    if (patientError || !patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all doses in the period
    const { data: doses, error: dosesError } = await supabase
      .from('doses')
      .select('status, scheduled_time, taken_time')
      .eq('patient_id', id)
      .gte('scheduled_time', startDate.toISOString())
      .order('scheduled_time', { ascending: false });

    if (dosesError) throw dosesError;

    // Calculate statistics
    const totalDoses = doses?.length || 0;
    const takenDoses = doses?.filter(d => d.status === 'taken').length || 0;
    const missedDoses = doses?.filter(d => d.status === 'missed').length || 0;
    const pendingDoses = doses?.filter(d => d.status === 'pending').length || 0;
    
    const adherenceRate = totalDoses > 0 
      ? parseFloat(((takenDoses / totalDoses) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name
        },
        period: {
          days: parseInt(days),
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString()
        },
        statistics: {
          totalDoses,
          takenDoses,
          missedDoses,
          pendingDoses,
          adherenceRate: parseFloat(adherenceRate)
        },
        recentDoses: doses?.slice(0, 10) || []
      }
    });
  } catch (error) {
    console.error('Get patient adherence error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient adherence',
      error: error.message
    });
  }
};

// ============================================
// CARETAKER MANAGEMENT
// ============================================

/**
 * @desc    Get all caretakers with patient counts
 * @route   GET /api/admin/caretakers
 * @access  Admin only
 */
exports.getAllCaretakers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('users')
      .select('id, name, email, phone, age, gender, city, status, created_at, updated_at', { count: 'exact' })
      .eq('role', 'caretaker')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: caretakers, error, count } = await query;

    if (error) throw error;

    // Get patient count for each caretaker
    const caretakersWithPatients = await Promise.all(
      caretakers.map(async (caretaker) => {
        const { count: patientCount } = await supabase
          .from('links')
          .select('*', { count: 'exact', head: true })
          .eq('caretaker_id', caretaker.id)
          .eq('status', 'active');

        return {
          ...caretaker,
          patientCount: patientCount || 0
        };
      })
    );

    res.json({
      success: true,
      data: caretakersWithPatients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all caretakers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching caretakers',
      error: error.message
    });
  }
};

/**
 * @desc    Get caretaker details with assigned patients
 * @route   GET /api/admin/caretakers/:id
 * @access  Admin only
 */
exports.getCaretakerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get caretaker details
    const { data: caretaker, error: caretakerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('role', 'caretaker')
      .single();

    if (caretakerError) throw caretakerError;

    if (!caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found'
      });
    }

    // Get assigned patients
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select(`
        id,
        status,
        created_at,
        patient:users!links_patient_id_fkey(id, name, email, phone, age, gender)
      `)
      .eq('caretaker_id', id);

    if (linksError) throw linksError;

    // Remove password from response
    delete caretaker.password;

    res.json({
      success: true,
      data: {
        ...caretaker,
        patients: links || [],
        stats: {
          totalPatients: links?.length || 0,
          activePatients: links?.filter(l => l.status === 'active').length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get caretaker by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching caretaker details',
      error: error.message
    });
  }
};

/**
 * @desc    Assign patient to caretaker
 * @route   POST /api/admin/links
 * @access  Admin only
 */
exports.assignPatientToCaretaker = async (req, res) => {
  try {
    const { caretaker_id, patient_id } = req.body;

    // Validate input
    if (!caretaker_id || !patient_id) {
      return res.status(400).json({
        success: false,
        message: 'Both caretaker_id and patient_id are required'
      });
    }

    // Verify caretaker exists and has correct role
    const { data: caretaker, error: caretakerError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', caretaker_id)
      .single();

    if (caretakerError || !caretaker) {
      return res.status(404).json({
        success: false,
        message: 'Caretaker not found'
      });
    }

    if (caretaker.role !== 'caretaker') {
      return res.status(400).json({
        success: false,
        message: 'User is not a caretaker'
      });
    }

    // Verify patient exists and has correct role
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', patient_id)
      .single();

    if (patientError || !patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    if (patient.role !== 'patient') {
      return res.status(400).json({
        success: false,
        message: 'User is not a patient'
      });
    }

    // Check if link already exists
    const { data: existingLink } = await supabase
      .from('links')
      .select('id, status')
      .eq('caretaker_id', caretaker_id)
      .eq('patient_id', patient_id)
      .maybeSingle();

    if (existingLink) {
      // If inactive, reactivate it
      if (existingLink.status === 'inactive') {
        const { data: updatedLink, error: updateError } = await supabase
          .from('links')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', existingLink.id)
          .select()
          .single();

        if (updateError) throw updateError;

        return res.json({
          success: true,
          message: 'Existing link reactivated',
          data: updatedLink
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Link already exists between this caretaker and patient'
      });
    }

    // Create new link
    const { data: newLink, error: createError } = await supabase
      .from('links')
      .insert({
        caretaker_id,
        patient_id,
        status: 'active'
      })
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json({
      success: true,
      message: 'Patient assigned to caretaker successfully',
      data: newLink
    });
  } catch (error) {
    console.error('Assign patient to caretaker error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning patient to caretaker',
      error: error.message
    });
  }
};

/**
 * @desc    Remove patient-caretaker link
 * @route   DELETE /api/admin/links/:linkId
 * @access  Admin only
 */
exports.removePatientCaretakerLink = async (req, res) => {
  try {
    const { linkId } = req.params;

    // Check if link exists
    const { data: link, error: checkError } = await supabase
      .from('links')
      .select('*')
      .eq('id', linkId)
      .single();

    if (checkError || !link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found'
      });
    }

    // Soft delete by setting status to inactive
    const { data: updatedLink, error: updateError } = await supabase
      .from('links')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', linkId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Patient-caretaker link removed successfully',
      data: updatedLink
    });
  } catch (error) {
    console.error('Remove patient-caretaker link error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing link',
      error: error.message
    });
  }
};

// ============================================
// DONATION REQUEST MANAGEMENT
// ============================================

/**
 * @desc    Get all donation requests with filtering
 * @route   GET /api/admin/donation-requests
 * @access  Admin only
 */
exports.getAllDonationRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, urgent } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('donation_requests')
      .select('*', { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add filters
    if (status) {
      query = query.eq('status', status);
    }
    if (urgent === 'true') {
      query = query.eq('is_urgent', true);
    }

    const { data: requests, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: requests || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all donation requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donation requests',
      error: error.message
    });
  }
};

/**
 * @desc    Approve a donation request
 * @route   PATCH /api/admin/donation-requests/:id/approve
 * @access  Admin only
 */
exports.approveDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Check if request exists
    const { data: request, error: checkError } = await supabase
      .from('donation_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve request with status: ${request.status}`
      });
    }

    // Update status to approved
    const { data: updatedRequest, error: updateError } = await supabase
      .from('donation_requests')
      .update({
        status: 'approved',
        admin_notes: notes || null,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Donation request approved successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Approve donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving donation request',
      error: error.message
    });
  }
};

/**
 * @desc    Reject a donation request
 * @route   PATCH /api/admin/donation-requests/:id/reject
 * @access  Admin only
 */
exports.rejectDonationRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    // Check if request exists
    const { data: request, error: checkError } = await supabase
      .from('donation_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject request with status: ${request.status}`
      });
    }

    // Update status to rejected
    const { data: updatedRequest, error: updateError } = await supabase
      .from('donation_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({
      success: true,
      message: 'Donation request rejected',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Reject donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting donation request',
      error: error.message
    });
  }
};

/**
 * @desc    Get all donations with details
 * @route   GET /api/admin/donations
 * @access  Admin only
 */
exports.getAllDonations = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('donations')
      .select(`
        *,
        donor:users!donations_donor_id_fkey(id, name, email, phone, city)
      `, { count: 'exact' })
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: donations, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: donations || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message
    });
  }
};

/**
 * @desc    Find suitable donors for urgent requests
 * @route   GET /api/admin/donation-requests/:id/find-donors
 * @access  Admin only
 */
exports.findSuitableDonors = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    // Get the donation request
    const { data: request, error: requestError } = await supabase
      .from('donation_requests')
      .select(`
        *,
        patient:users!donation_requests_patient_id_fkey(id, name, city)
      `)
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    // Find active donors
    const { data: allDonors, error: donorsError } = await supabase
      .from('users')
      .select('id, name, email, phone, city, created_at')
      .eq('role', 'donor')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (donorsError) throw donorsError;

    // Get donation history for each donor
    const donorsWithHistory = await Promise.all(
      allDonors.map(async (donor) => {
        const { count: totalDonations } = await supabase
          .from('donations')
          .select('*', { count: 'exact', head: true })
          .eq('donor_id', donor.id)
          .eq('status', 'completed');

        const { data: recentDonations } = await supabase
          .from('donations')
          .select('created_at')
          .eq('donor_id', donor.id)
          .order('created_at', { ascending: false })
          .limit(1);

        return {
          ...donor,
          totalDonations: totalDonations || 0,
          lastDonation: recentDonations?.[0]?.created_at || null,
          sameCity: donor.city === request.patient?.city
        };
      })
    );

    // Sort donors: prioritize same city, then by total donations
    const sortedDonors = donorsWithHistory
      .sort((a, b) => {
        if (a.sameCity && !b.sameCity) return -1;
        if (!a.sameCity && b.sameCity) return 1;
        return b.totalDonations - a.totalDonations;
      })
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        request: {
          id: request.id,
          medication_name: request.medication_name,
          quantity: request.quantity,
          urgent: request.urgent,
          patient: request.patient
        },
        suitableDonors: sortedDonors,
        total: sortedDonors.length
      }
    });
  } catch (error) {
    console.error('Find suitable donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error finding suitable donors',
      error: error.message
    });
  }
};

// ============================================
// ENHANCED ANALYTICS
// ============================================

/**
 * @desc    Get comprehensive dashboard analytics
 * @route   GET /api/admin/analytics/dashboard
 * @access  Admin only
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Get all users to calculate role counts
    const { data: allUsers, error: userError } = await supabase
      .from('users')
      .select('role, status');

    if (userError) throw userError;

    // Calculate user statistics
    const userStats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === 'active').length,
      inactive: allUsers.filter(u => u.status === 'inactive').length,
      byRole: {
        patient: allUsers.filter(u => u.role === 'patient').length,
        caretaker: allUsers.filter(u => u.role === 'caretaker').length,
        donor: allUsers.filter(u => u.role === 'donor').length,
        admin: allUsers.filter(u => u.role === 'admin').length
      }
    };

    // Get medication count and most used
    const { data: allMedications, error: medError } = await supabase
      .from('medications')
      .select('name');

    if (medError) throw medError;

    // Count medication frequency
    const medicationFrequency = allMedications.reduce((acc, med) => {
      acc[med.name] = (acc[med.name] || 0) + 1;
      return acc;
    }, {});

    const mostUsedMedications = Object.entries(medicationFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Get donation statistics
    const { count: totalDonations, error: donationCountError } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true });

    if (donationCountError) throw donationCountError;

    const { count: completedDonations } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');

    const { count: pendingDonations } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Get donation requests stats
    const { count: totalRequests } = await supabase
      .from('donation_requests')
      .select('*', { count: 'exact', head: true });

    const { count: urgentRequests } = await supabase
      .from('donation_requests')
      .select('*', { count: 'exact', head: true })
      .eq('urgent', true)
      .eq('status', 'pending');

    // Calculate average adherence rate
    const { data: allDoses, error: doseError } = await supabase
      .from('doses')
      .select('status');

    if (doseError) throw doseError;

    const totalDoses = allDoses.length;
    const takenDoses = allDoses.filter(d => d.status === 'taken').length;
    const averageAdherenceRate = totalDoses > 0 
      ? ((takenDoses / totalDoses) * 100).toFixed(2)
      : 0;

    // Get caretaker-patient links
    const { count: totalLinks } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    res.json({
      success: true,
      data: {
        users: userStats,
        medications: {
          total: allMedications.length,
          mostUsed: mostUsedMedications
        },
        donations: {
          total: totalDonations || 0,
          completed: completedDonations || 0,
          pending: pendingDonations || 0,
          completionRate: totalDonations > 0 
            ? parseFloat(((completedDonations / totalDonations) * 100).toFixed(2))
            : 0
        },
        donationRequests: {
          total: totalRequests || 0,
          urgent: urgentRequests || 0
        },
        adherence: {
          totalDoses: totalDoses || 0,
          takenDoses: takenDoses || 0,
          averageRate: parseFloat(averageAdherenceRate)
        },
        caretakerPatientLinks: totalLinks || 0
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new donation request (Admin)
 * @route   POST /api/admin/donation-requests
 * @access  Admin only
 */
exports.createDonationRequest = async (req, res) => {
  try {
    const {
      hospital_name,
      location,
      blood_group,
      units_needed,
      urgency_level,
      contact_number,
      notes
    } = req.body;

    // Validate required fields
    if (!hospital_name || !location || !blood_group || !units_needed || !contact_number) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Create donation request
    const { data: request, error: createError } = await supabase
      .from('donation_requests')
      .insert([{
        hospital_name,
        location,
        blood_group,
        units_needed,
        urgency_level: urgency_level || 'Medium',
        contact_number,
        notes,
        status: 'active'
      }])
      .select()
      .single();

    if (createError) throw createError;

    // If urgent, find suitable donors and create notifications
    if (urgency_level === 'Critical' || urgency_level === 'High') {
      const { data: donors } = await supabase
        .from('users')
        .select('id, name, email, blood_group, city')
        .eq('role', 'donor')
        .eq('blood_group', blood_group);

      if (donors && donors.length > 0) {
        // Create notifications for all matching donors
        const notifications = donors.map(donor => ({
          user_id: donor.id,
          type: 'donation_request',
          message: `🚨 URGENT: ${hospital_name} needs ${units_needed} unit(s) of ${blood_group} blood. Location: ${location}. Contact: ${contact_number}`,
          is_read: false
        }));

        await supabase.from('notifications').insert(notifications);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Donation request created successfully',
      data: request
    });
  } catch (error) {
    console.error('Create donation request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating donation request',
      error: error.message
    });
  }
};

/**
 * @desc    Notify all donors about a blood request
 * @route   POST /api/admin/donation-requests/:id/notify-donors
 * @access  Admin only
 */
exports.notifyDonorsAboutRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the donation request
    const { data: request, error: requestError } = await supabase
      .from('donation_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({
        success: false,
        message: 'Donation request not found'
      });
    }

    // Find all donors with matching blood group
    const { data: donors, error: donorsError } = await supabase
      .from('users')
      .select('id, name, email, blood_group')
      .eq('role', 'donor')
      .eq('blood_group', request.blood_group);

    if (donorsError) throw donorsError;

    if (!donors || donors.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No donors found with blood group ${request.blood_group}`
      });
    }

    // Create notifications for all matching donors
    const notifications = donors.map(donor => ({
      user_id: donor.id,
      type: 'donation_request',
      message: `🩸 ${request.hospital_name} needs ${request.units_needed} unit(s) of ${request.blood_group} blood. Urgency: ${request.urgency_level}. Location: ${request.location}. Contact: ${request.contact_number}`,
      is_read: false
    }));

    const { error: notifyError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifyError) throw notifyError;

    res.json({
      success: true,
      message: `Notified ${donors.length} donor(s) successfully`,
      data: {
        notified_count: donors.length,
        donors: donors.map(d => ({ id: d.id, name: d.name, email: d.email }))
      }
    });
  } catch (error) {
    console.error('Notify donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error notifying donors',
      error: error.message
    });
  }
};

/**
 * @desc    Get all donors (for assignment/notification)
 * @route   GET /api/admin/donors
 * @access  Admin only
 */
exports.getAllDonors = async (req, res) => {
  try {
    const { blood_group, city, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('id, name, email, phone, blood_group, city, age, gender, created_at', { count: 'exact' })
      .eq('role', 'donor')
      .range(offset, offset + parseInt(limit) - 1)
      .order('created_at', { ascending: false });

    if (blood_group) {
      query = query.eq('blood_group', blood_group);
    }

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }

    const { data: donors, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: donors || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get all donors error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching donors',
      error: error.message
    });
  }
};
