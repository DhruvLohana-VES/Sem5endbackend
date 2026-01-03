const supabase = require('../config/supabase');

// @desc    Get adherence report for patient
// @route   GET /api/reports/adherence/:patientId
// @access  Private (Caretaker and Patient)
exports.getAdherenceReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { days = 30 } = req.query;

    if (req.user.role === 'caretaker') {
      const { data: link } = await supabase
        .from('links')
        .select('id')
        .eq('caretaker_id', req.user.id)
        .eq('patient_id', patientId)
        .eq('status', 'accepted')
        .single();
      if (!link) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (req.user.role === 'patient' && req.user.id !== patientId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { data: patient } = await supabase
      .from('users')
      .select('name')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const { data: doses, error } = await supabase
      .from('doses')
      .select(`
        id,
        scheduled_time,
        status,
        medications (id, name, dosage)
      `)
      .eq('patient_id', patientId)
      .gte('scheduled_time', startDate.toISOString());

    if (error) throw error;

    const totalDoses = doses.length;
    const takenDoses = doses.filter(d => d.status === 'taken').length;
    const missedDoses = doses.filter(d => d.status === 'missed').length;

    const overallAdherence = totalDoses > 0 
      ? Math.round((takenDoses / totalDoses) * 100) 
      : 0;

    // Daily data
    const dailyMap = {};
    doses.forEach(dose => {
      const date = dose.scheduled_time.split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { date, taken: 0, missed: 0, total: 0 };
      }
      dailyMap[date].total++;
      if (dose.status === 'taken') dailyMap[date].taken++;
      if (dose.status === 'missed') dailyMap[date].missed++;
    });

    const dailyData = Object.values(dailyMap).map(day => ({
      ...day,
      adherence: day.total > 0 ? Math.round((day.taken / day.total) * 100) : 0
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Medication-wise adherence
    const medicationMap = {};
    doses.forEach(dose => {
      if (!dose.medications) return;
      
      const medId = dose.medications.id;
      if (!medicationMap[medId]) {
        medicationMap[medId] = {
          medicationName: dose.medications.name,
          total: 0,
          taken: 0,
          missed: 0
        };
      }
      medicationMap[medId].total++;
      if (dose.status === 'taken') medicationMap[medId].taken++;
      if (dose.status === 'missed') medicationMap[medId].missed++;
    });

    const medicationWise = Object.values(medicationMap).map(med => ({
      ...med,
      adherence: med.total > 0 ? Math.round((med.taken / med.total) * 100) : 0
    }));

    // Update patient's adherence rate
    await supabase
      .from('users')
      .update({ adherence_rate: overallAdherence })
      .eq('id', patientId);

    res.json({
      patientId,
      patientName: patient.name,
      period: parseInt(days),
      overallAdherence,
      totalDoses,
      takenDoses,
      missedDoses,
      dailyData,
      medicationWise
    });
  } catch (error) {
    console.error('Get adherence report error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
