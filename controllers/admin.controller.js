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
      ? ((takenDoses / totalDoses) * 100).toFixed(2) 
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
