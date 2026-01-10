const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const supabase = require('./config/supabase');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: '*', // Allow all origins for public API
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Test Supabase Connection
(async () => {
  try {
    const { data, error } = await supabase.from('users').select('count');
    if (error) throw error;
    console.log('✅ Supabase Connected Successfully');
  } catch (err) {
    console.error('❌ Supabase Connection Error:', err.message);
    console.log('⚠️  Please run the database schema SQL in your Supabase SQL Editor');
  }
})();

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/patients', require('./routes/patient.routes'));
app.use('/api/medications', require('./routes/medication.routes'));
app.use('/api/doses', require('./routes/dose.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/links', require('./routes/link.routes'));
app.use('/api/donor', require('./routes/donor.routes'));
app.use('/api/admin', require('./routes/admin.routes')); // Admin routes (protected)

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📱 Network: http://192.168.1.39:${PORT}/api`);
});
