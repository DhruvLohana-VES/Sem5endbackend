const supabase = require('../config/supabase');

// @desc    Send invitation to patient
// @route   POST /api/links/invite
// @access  Private (Caretaker only)
exports.sendInvitation = async (req, res) => {
  try {
    const { patientEmail } = req.body;

    const { data: patient } = await supabase
      .from('users')
      .select('id, name')
      .eq('email', patientEmail)
      .eq('role', 'patient')
      .single();

    if (!patient) {
      return res.status(404).json({ message: 'Patient not found with this email' });
    }

    const { data: existingLink } = await supabase
      .from('links')
      .select('id, status')
      .eq('caretaker_id', req.user.id)
      .eq('patient_id', patient.id)
      .single();

    if (existingLink) {
      if (existingLink.status === 'accepted') {
        return res.status(400).json({ message: 'Already linked with this patient' });
      }
      if (existingLink.status === 'pending') {
        return res.status(400).json({ message: 'Invitation already sent' });
      }
    }

    const { data: link, error } = await supabase
      .from('links')
      .insert([{
        caretaker_id: req.user.id,
        patient_id: patient.id,
        invited_email: patientEmail,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase.from('notifications').insert([{
      user_id: patient.id,
      type: 'link_request',
      message: `${req.user.name} has sent you a caretaker invitation`,
      metadata: { linkId: link.id }
    }]);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitationId: link.id
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get pending invitations (for patient)
// @route   GET /api/links/pending
// @access  Private (Patient only)
exports.getPendingInvitations = async (req, res) => {
  try {
    const { data: links, error } = await supabase
      .from('links')
      .select(`
        id,
        status,
        created_at,
        users!links_caretaker_id_fkey (id, name, email, phone)
      `)
      .eq('patient_id', req.user.id)
      .eq('status', 'pending');

    if (error) throw error;

    const invitations = links.map(link => ({
      id: link.id,
      caretakerName: link.users.name,
      caretakerEmail: link.users.email,
      caretakerPhone: link.users.phone,
      status: link.status,
      createdAt: link.created_at
    }));

    res.json(invitations);
  } catch (error) {
    console.error('Get pending invitations error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Accept invitation
// @route   POST /api/links/:id/accept
// @access  Private (Patient only)
exports.acceptInvitation = async (req, res) => {
  try {
    const { data: link } = await supabase
      .from('links')
      .select('caretaker_id')
      .eq('id', req.params.id)
      .eq('patient_id', req.user.id)
      .eq('status', 'pending')
      .single();

    if (!link) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    const { error } = await supabase
      .from('links')
      .update({ status: 'accepted' })
      .eq('id', req.params.id);

    if (error) throw error;

    await supabase.from('notifications').insert([{
      user_id: link.caretaker_id,
      type: 'patient_linked',
      message: `${req.user.name} has accepted your invitation`
    }]);

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Unlink patient
// @route   DELETE /api/links/:patientId
// @access  Private (Caretaker only)
exports.unlinkPatient = async (req, res) => {
  try {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('caretaker_id', req.user.id)
      .eq('patient_id', req.params.patientId);

    if (error) throw error;

    res.json({ message: 'Unlinked successfully' });
  } catch (error) {
    console.error('Unlink patient error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
