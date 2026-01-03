const supabase = require('../config/supabase');

// @desc    Get donor profile
// @route   GET /api/donor/profile
// @access  Private (Donor only)
exports.getProfile = async (req, res) => {
  try {
    const { data: donor, error } = await supabase
      .from('users')
      .select('id, name, email, phone, blood_group, date_of_birth, city, address, is_available, total_donations, member_since')
      .eq('id', req.user.id)
      .eq('role', 'donor')
      .single();

    if (error || !donor) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    res.json({
      id: donor.id,
      fullName: donor.name,
      email: donor.email,
      phone: donor.phone,
      bloodGroup: donor.blood_group,
      dateOfBirth: donor.date_of_birth,
      city: donor.city,
      address: donor.address,
      isAvailable: donor.is_available,
      totalDonations: donor.total_donations,
      memberSince: donor.member_since
    });
  } catch (error) {
    console.error('Get donor profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update donor profile
// @route   PATCH /api/donor/profile
// @access  Private (Donor only)
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'phone', 'date_of_birth', 'city', 'address', 'blood_group'];
    const updates = {};

    Object.keys(req.body).forEach(key => {
      const dbKey = key === 'dateOfBirth' ? 'date_of_birth' : 
                    key === 'bloodGroup' ? 'blood_group' : key;
      if (allowedFields.includes(dbKey)) {
        updates[dbKey] = req.body[key];
      }
    });

    const { data: donor, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: donor.id,
      name: donor.name,
      phone: donor.phone,
      bloodGroup: donor.blood_group,
      city: donor.city,
      address: donor.address
    });
  } catch (error) {
    console.error('Update donor profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Toggle donor availability
// @route   PATCH /api/donor/availability/toggle
// @access  Private (Donor only)
exports.toggleAvailability = async (req, res) => {
  try {
    const { data: currentUser } = await supabase
      .from('users')
      .select('is_available')
      .eq('id', req.user.id)
      .single();

    const { data: donor, error } = await supabase
      .from('users')
      .update({ is_available: !currentUser.is_available })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      id: donor.id,
      isAvailable: donor.is_available
    });
  } catch (error) {
    console.error('Toggle availability error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get donor stats
// @route   GET /api/donor/stats
// @access  Private (Donor only)
exports.getStats = async (req, res) => {
  try {
    const { data: donor } = await supabase
      .from('users')
      .select('total_donations')
      .eq('id', req.user.id)
      .single();

    res.json({
      totalDonations: donor.total_donations,
      livesSaved: donor.total_donations * 3
    });
  } catch (error) {
    console.error('Get donor stats error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get active donation requests
// @route   GET /api/donor/requests/active
// @access  Private (Donor only)
exports.getActiveRequests = async (req, res) => {
  try {
    const { data: donor } = await supabase
      .from('users')
      .select('blood_group')
      .eq('id', req.user.id)
      .single();

    const { data: requests, error } = await supabase
      .from('donation_requests')
      .select('*')
      .eq('blood_group', donor.blood_group)
      .eq('status', 'active')
      .gte('expires_at', new Date().toISOString())
      .order('urgency_level', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = requests.map(req => ({
      _id: req.id,
      hospitalName: req.hospital_name,
      location: req.location,
      bloodGroup: req.blood_group,
      unitsNeeded: req.units_needed,
      urgencyLevel: req.urgency_level,
      contactNumber: req.contact_number,
      notes: req.notes,
      status: req.status,
      createdAt: req.created_at
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get active requests error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Accept donation request
// @route   POST /api/donor/requests/:requestId/accept
// @access  Private (Donor only)
exports.acceptRequest = async (req, res) => {
  try {
    const { data: request } = await supabase
      .from('donation_requests')
      .select('*')
      .eq('id', req.params.requestId)
      .single();

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const donationId = `DON-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    const { data: donation, error } = await supabase
      .from('donations')
      .insert([{
        donor_id: req.user.id,
        request_id: request.id,
        hospital_name: request.hospital_name,
        location: request.location,
        blood_group: request.blood_group,
        units: 1,
        date: new Date().toISOString(),
        donation_id: donationId,
        notes: `Accepted request for ${request.hospital_name}`
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('users')
      .update({ total_donations: supabase.raw('total_donations + 1') })
      .eq('id', req.user.id);

    res.json({
      message: 'Request accepted successfully!',
      requestId: request.id,
      donationId: donation.donation_id
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get all donations for donor
// @route   GET /api/donor/donations
// @access  Private (Donor only)
exports.getDonations = async (req, res) => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', req.user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    const formatted = donations.map(d => ({
      _id: d.id,
      hospitalName: d.hospital_name,
      location: d.location,
      bloodGroup: d.blood_group,
      units: d.units,
      date: d.date,
      donationId: d.donation_id,
      notes: d.notes
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get recent donations (last 3)
// @route   GET /api/donor/donations/recent
// @access  Private (Donor only)
exports.getRecentDonations = async (req, res) => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', req.user.id)
      .order('date', { ascending: false })
      .limit(3);

    if (error) throw error;

    const formatted = donations.map(d => ({
      _id: d.id,
      hospitalName: d.hospital_name,
      location: d.location,
      bloodGroup: d.blood_group,
      units: d.units,
      date: d.date,
      donationId: d.donation_id,
      notes: d.notes
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get recent donations error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
