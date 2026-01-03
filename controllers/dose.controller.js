const supabase = require('../config/supabase');

// @desc    Get today's doses for patient
// @route   GET /api/doses/today
// @access  Private (Patient only)
exports.getTodayDoses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: doses, error } = await supabase
      .from('doses')
      .select(`
        id,
        scheduled_time,
        status,
        taken_at,
        medications (id, name, dosage)
      `)
      .eq('patient_id', req.user.id)
      .gte('scheduled_time', today.toISOString())
      .lt('scheduled_time', tomorrow.toISOString())
      .order('scheduled_time', { ascending: true });

    if (error) throw error;

    const formatted = doses.map(dose => ({
      id: dose.id,
      medicationId: dose.medications,
      patientId: req.user.id,
      scheduledTime: dose.scheduled_time,
      status: dose.status,
      takenAt: dose.taken_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get today doses error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get dose history
// @route   GET /api/doses/history
// @access  Private (Patient only)
exports.getDoseHistory = async (req, res) => {
  try {
    const { days = 30, page = 1, limit = 50 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: doses, error, count } = await supabase
      .from('doses')
      .select(`
        id,
        scheduled_time,
        status,
        taken_at,
        medications (id, name, dosage)
      `, { count: 'exact' })
      .eq('patient_id', req.user.id)
      .gte('scheduled_time', startDate.toISOString())
      .order('scheduled_time', { ascending: false })
      .range((parseInt(page) - 1) * parseInt(limit), parseInt(page) * parseInt(limit) - 1);

    if (error) throw error;

    const formatted = doses.map(dose => ({
      id: dose.id,
      medicationId: dose.medications,
      scheduledTime: dose.scheduled_time,
      status: dose.status,
      takenAt: dose.taken_at
    }));

    res.json({
      doses: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get dose history error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Mark dose as taken
// @route   PATCH /api/doses/:id/take
// @access  Private (Patient only)
exports.markAsTaken = async (req, res) => {
  try {
    const { data: dose } = await supabase
      .from('doses')
      .select('patient_id')
      .eq('id', req.params.id)
      .single();

    if (!dose) {
      return res.status(404).json({ message: 'Dose not found' });
    }

    if (dose.patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data: updated, error } = await supabase
      .from('doses')
      .update({
        status: 'taken',
        taken_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select(`
        id,
        scheduled_time,
        status,
        taken_at,
        medications (id, name, dosage)
      `)
      .single();

    if (error) throw error;

    res.json({
      id: updated.id,
      status: updated.status,
      takenAt: updated.taken_at,
      medicationId: updated.medications
    });
  } catch (error) {
    console.error('Mark as taken error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Mark dose as missed
// @route   PATCH /api/doses/:id/miss
// @access  Private (Patient only)
exports.markAsMissed = async (req, res) => {
  try {
    const { data: dose } = await supabase
      .from('doses')
      .select('patient_id')
      .eq('id', req.params.id)
      .single();

    if (!dose) {
      return res.status(404).json({ message: 'Dose not found' });
    }

    if (dose.patient_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data: updated, error } = await supabase
      .from('doses')
      .update({ status: 'missed' })
      .eq('id', req.params.id)
      .select(`
        id,
        scheduled_time,
        status,
        taken_at,
        medications (id, name, dosage)
      `)
      .single();

    if (error) throw error;

    res.json({
      id: updated.id,
      status: updated.status,
      medicationId: updated.medications
    });
  } catch (error) {
    console.error('Mark as missed error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
