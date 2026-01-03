const supabase = require('../config/supabase');

// @desc    Get all patients (for caretaker)
// @route   GET /api/patients
// @access  Private (Caretaker only)
exports.getAllPatients = async (req, res) => {
  try {
    // Get all accepted links for this caretaker with patient details
    const { data: links, error } = await supabase
      .from('links')
      .select(`
        patient_id,
        users!links_patient_id_fkey (
          id, name, email, phone, age, gender, status, adherence_rate, created_at
        )
      `)
      .eq('caretaker_id', req.user.id)
      .eq('status', 'accepted');

    if (error) throw error;

    const patients = links.map(link => {
      const user = link.users;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        status: user.status,
        adherenceRate: user.adherence_rate,
        createdAt: user.created_at
      };
    });

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get patient by ID
// @route   GET /api/patients/:id
// @access  Private
exports.getPatientById = async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('users')
      .select('id, name, email, phone, age, gender, status, adherence_rate, created_at')
      .eq('id', req.params.id)
      .eq('role', 'patient')
      .single();

    if (error || !patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if caretaker has access to this patient
    if (req.user.role === 'caretaker') {
      const { data: link } = await supabase
        .from('links')
        .select('id')
        .eq('caretaker_id', req.user.id)
        .eq('patient_id', req.params.id)
        .eq('status', 'accepted')
        .single();

      if (!link) {
        return res.status(403).json({ message: 'Access denied to this patient' });
      }
    }

    res.json({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      age: patient.age,
      gender: patient.gender,
      status: patient.status,
      adherenceRate: patient.adherence_rate,
      createdAt: patient.created_at
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
