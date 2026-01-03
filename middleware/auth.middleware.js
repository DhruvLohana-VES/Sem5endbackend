const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, phone, age, gender, blood_group, city, is_available, total_donations, adherence_rate, status')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user to request (transform to camelCase)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      age: user.age,
      gender: user.gender,
      bloodGroup: user.blood_group,
      city: user.city,
      isAvailable: user.is_available,
      totalDonations: user.total_donations,
      adherenceRate: user.adherence_rate,
      status: user.status
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('🔐 Authorization check - Required roles:', roles, 'User role:', req.user?.role);
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('❌ Authorization failed - user role does not match');
      return res.status(403).json({ 
        message: `Role '${req.user.role}' is not authorized to access this resource` 
      });
    }

    console.log('✅ Authorization passed');
    next();
  };
};
