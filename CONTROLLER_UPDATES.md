# 🔄 Complete Controller Migration to Supabase

Below are all the updated controllers for Supabase. Copy each section to replace the corresponding controller file.

## ✅ Already Updated
- auth.controller.js
- middleware/auth.middleware.js
- config/supabase.js (new)
- server.js

## 📝 Files to Update

### 1. controllers/patient.controller.js

```javascript
const supabase = require('../config/supabase');

exports.getAllPatients = async (req, res) => {
  try {
    const { data: links, error } = await supabase
      .from('links')
      .select(`patient_id, users!links_patient_id_fkey (id, name, email, phone, age, gender, status, adherence_rate, created_at)`)
      .eq('caretaker_id', req.user.id)
      .eq('status', 'accepted');

    if (error) throw error;

    const patients = links.map(link => ({
      id: link.users.id,
      name: link.users.name,
      email: link.users.email,
      phone: link.users.phone,
      age: link.users.age,
      gender: link.users.gender,
      status: link.users.status,
      adherenceRate: link.users.adherence_rate,
      createdAt: link.users.created_at
    }));

    res.json(patients);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

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
```

### 2. controllers/medication.controller.js

```javascript
const supabase = require('../config/supabase');

exports.createMedication = async (req, res) => {
  try {
    const { patientId, name, dosage, frequency, timing, instructions, startDate, endDate } = req.body;

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
        start_date: startDate,
        end_date: endDate
      }])
      .select()
      .single();

    if (error) throw error;

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

exports.getMedicationsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;

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

    const formattedMeds = medications.map(med => ({
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

    res.json(formattedMeds);
  } catch (error) {
    console.error('Get medications error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

exports.getAllMedications = async (req, res) => {
  try {
    const { data: medications, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', req.user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedMeds = medications.map(med => ({
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

    res.json(formattedMeds);
  } catch (error) {
    console.error('Get all medications error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

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
```

### 3. controllers/dose.controller.js

```javascript
const supabase = require('../config/supabase');

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
```

## 🚀 Quick Install Script

Save this as `install-supabase.ps1` and run it:

```powershell
# Navigate to backend
cd "c:\Users\Dhruv Lohana\Desktop\Naya Project\CC Backend"

# Install dependencies
npm install

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run the database/schema.sql in your Supabase SQL Editor"
Write-Host "2. Update remaining controllers (see CONTROLLER_UPDATES.md)"
Write-Host "3. Run: npm run dev"
Write-Host ""
```

## ⏭️ Remaining Controllers

I have the complete code for these controllers ready. Would you like me to:
1. Create complete files for notification, report, link, and donor controllers?
2. Or create a script to auto-update all of them?

Let me know and I'll finish the migration!
