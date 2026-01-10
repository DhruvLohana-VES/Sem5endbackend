// scripts/seed-admin.js
// Add default admin user to Supabase

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const createAdminUser = async () => {
  try {
    console.log('🔧 Creating default admin user...\n');

    // Check if admin already exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'admin@gmail.com')
      .single();

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('\n🔐 Use these credentials to login:');
      console.log('Email: admin@gmail.com');
      console.log('Password: Test@123');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    // Create admin user
    const { data: adminUser, error } = await supabase
      .from('users')
      .insert([
        {
          name: 'System Administrator',
          email: 'admin@gmail.com',
          password: hashedPassword,
          role: 'admin',
          phone: '+91 99999 99999',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    console.log('\n🔐 Admin Credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: Test@123');
    console.log('\n📝 Note: Please change this password after first login!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (error.details) console.error('Details:', error.details);
    if (error.hint) console.error('Hint:', error.hint);
    process.exit(1);
  }
};

createAdminUser();
