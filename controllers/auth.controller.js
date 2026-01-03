const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('📥 Registration request body:', req.body);
    console.log('🔍 Request body keys:', Object.keys(req.body));
    console.log('🔍 Content-Type:', req.headers['content-type']);
    const { name, email, password, role, phone, age, gender, bloodGroup, dateOfBirth, city, address } = req.body;

    // Check if user exists
    console.log('🔍 Checking for existing user...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    console.log('🔍 Existing user check result:', { existingUser, checkError });

    if (existingUser) {
      console.log('⚠️ User already exists, returning 400');
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Prepare user data
    const userData = {
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null
    };

    // Add role-specific fields
    if (role === 'patient') {
      if (age) userData.age = age;
      if (gender) userData.gender = gender;
    }

    if (role === 'donor') {
      if (bloodGroup) userData.blood_group = bloodGroup;
      if (dateOfBirth) userData.date_of_birth = dateOfBirth;
      if (city) userData.city = city;
      if (address) userData.address = address;
    }

    // Create user
    console.log('💾 Attempting to insert user with data:', userData);
    const { data: user, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();

    if (error) {
      console.log('❌ Supabase error:', error);
      throw error;
    }

    // Generate token
    const token = generateToken(user.id);

    // Build response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    if (role === 'patient') {
      userResponse.age = user.age;
      userResponse.gender = user.gender;
    }

    if (role === 'donor') {
      userResponse.bloodGroup = user.blood_group;
      userResponse.city = user.city;
      userResponse.isAvailable = user.is_available;
    }

    res.status(201).json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Register error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    // Build user response based on role
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    if (user.role === 'patient') {
      userResponse.age = user.age;
      userResponse.gender = user.gender;
      userResponse.adherenceRate = user.adherence_rate;
    }

    if (user.role === 'donor') {
      userResponse.bloodGroup = user.blood_group;
      userResponse.city = user.city;
      userResponse.isAvailable = user.is_available;
      userResponse.totalDonations = user.total_donations;
    }

    res.json({
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, age, gender, blood_group, city, address, is_available, total_donations, adherence_rate, status, created_at')
      .eq('id', req.user.id)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Transform snake_case to camelCase for response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
      createdAt: user.created_at
    };

    if (user.role === 'patient') {
      userResponse.age = user.age;
      userResponse.gender = user.gender;
      userResponse.adherenceRate = user.adherence_rate;
    }

    if (user.role === 'donor') {
      userResponse.bloodGroup = user.blood_group;
      userResponse.city = user.city;
      userResponse.address = user.address;
      userResponse.isAvailable = user.is_available;
      userResponse.totalDonations = user.total_donations;
    }

    res.json(userResponse);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
