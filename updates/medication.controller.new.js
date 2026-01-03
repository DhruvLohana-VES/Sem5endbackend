/*
 * ========================================
 * MEDICATION CONTROLLER - SUPABASE VERSION
 * ========================================
 * Copy this entire file to: controllers/medication.controller.js
 */

const supabase = require('../config/supabase');

// @desc    Create medication
// @route   POST /api/medications
// @access  Private (Caretaker only)
exports.createMedication = async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, timing, instructions, startDate, endDate } = req.body;

    // Verify caretaker has access to patient
    const { data: link } = await supabase
      .from('links')
      .select('id')
      .eq('caretaker_id', req.user.id)
      .eq('patient_id', patientId)
      .eq('status', 'accepted')
      .single();

    if (!link) {
      return res.status(403).json({ message: 'Access denied to this patient' });
    }

    const { data: medication, error } = await supabase
      .from('medications')
      .insert([{
        patient_id: patientId,
        caretaker_id: req.user.id,
        name,
        dosage,
        frequency,
        timing,
        instructions,
        start_date: startDate || new Date().toISOString().split('T')[0],
        end_date: endDate || null
      }])
      .select()
      .single();

    if (error) throw error;

    // Create notification for patient
    await supabase
      .from('notifications')
      .insert([{
        user_id: patientId,
        type: 'medication_added',
        message: `${req.user.name} added ${name} to your medications`
      }]);

    res.status(201).json({
      id: medication.id,
      patientId: medication.patient_id,
      caretakerId: medication.caretaker_id,
      name: medication.name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      timing: medication.timing,
      instructions: medication.instructions,
      startDate: medication.start_date,
      endDate: medication.end_date,
      isActive: medication.is_active,
      createdAt: medication.created_at
    });
  } catch (error) {
    console.error('Create medication error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get medications by patient ID
// @route   GET /api/medications/patient/:patientId
// @access  Private
exports.getMedicationsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Check access
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

    const { data: medications, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = medications.map(med => ({
      id: med.id,
      patientId: med.patient_id,
      caretakerId: med.caretaker_id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timing: med.timing,
      instructions: med.instructions,
      startDate: med.start_date,
      endDate: med.end_date,
      isActive: med.is_active,
      createdAt: med.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all medications for current patient
// @route   GET /api/medications
// @access  Private (Patient only)
exports.getAllMedications = async (req, res) => {
  try {
    const { data: medications, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', req.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = medications.map(med => ({
      id: med.id,
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      timing: med.timing,
      instructions: med.instructions,
      startDate: med.start_date,
      endDate: med.end_date,
      isActive: med.is_active,
      createdAt: med.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get all medications error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update medication
// @route   PATCH /api/medications/:id
// @access  Private (Caretaker only)
exports.updateMedication = async (req, res) => {
  try {
    const { data: medication } = await supabase
      .from('medications')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (medication.caretaker_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.dosage) updates.dosage = req.body.dosage;
    if (req.body.frequency) updates.frequency = req.body.frequency;
    if (req.body.timing) updates.timing = req.body.timing;
    if (req.body.instructions !== undefined) updates.instructions = req.body.instructions;
    if (req.body.endDate !== undefined) updates.end_date = req.body.endDate;

    const { data: updated, error } = await supabase
      .from('medications')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // Notify patient
    await supabase
      .from('notifications')
      .insert([{
        user_id: medication.patient_id,
        type: 'medication_updated',
        message: `Your medication ${medication.name} has been updated`
      }]);

    res.json({
      id: updated.id,
      name: updated.name,
      dosage: updated.dosage,
      frequency: updated.frequency,
      timing: updated.timing,
      instructions: updated.instructions,
      isActive: updated.is_active
    });
  } catch (error) {
    console.error('Update medication error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete medication
// @route   DELETE /api/medications/:id
// @access  Private (Caretaker only)
exports.deleteMedication = async (req, res) => {
  try {
    const { data: medication } = await supabase
      .from('medications')
      .select('caretaker_id')
      .eq('id', req.params.id)
      .single();

    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }

    if (medication.caretaker_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { error } = await supabase
      .from('medications')
      .update({ is_active: false })
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ message: 'Medication deleted successfully' });
  } catch (error) {
    console.error('Delete medication error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
