// scripts/check-and-create-admin.js
// Check if admin exists and create if schema allows

require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const checkAndCreateAdmin = async () => {
  try {
    console.log('🔍 Checking for admin user...\n');

    // Check if admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('users')
      .select('id, email, role, status')
      .eq('email', 'admin@gmail.com')
      .maybeSingle();

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('📊 Status:', existingAdmin.status);
      console.log('\n🔐 Login Credentials:');
      console.log('Email: admin@gmail.com');
      console.log('Password: Test@123');
      console.log('\n✅ You can login now!\n');
      process.exit(0);
    }

    console.log('⚠️  Admin user does not exist. Attempting to create...\n');

    // Try to create admin user
    const hashedPassword = await bcrypt.hash('Test@123', 10);

    const { data: adminUser, error: insertError } = await supabase
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

    if (insertError) {
      console.log('❌ Failed to create admin user\n');
      console.log('Error:', insertError.message);
      
      if (insertError.message.includes('violates check constraint') || 
          insertError.message.includes('users_role_check')) {
        console.log('\n📋 DATABASE SCHEMA ISSUE DETECTED\n');
        console.log('The database does not allow "admin" role yet.');
        console.log('\n🔧 SOLUTION: Run this SQL in Supabase Dashboard:\n');
        console.log('──────────────────────────────────────────────────');
        console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
        console.log('ALTER TABLE users ADD CONSTRAINT users_role_check');
        console.log("  CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));");
        console.log('──────────────────────────────────────────────────');
        console.log('\n🌐 Supabase Dashboard: https://eprhxuegfxkkkjlrjwsz.supabase.co');
        console.log('   → SQL Editor → New Query → Paste & Run\n');
      } else {
        console.log('Full error:', insertError);
      }
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Role:', adminUser.role);
    console.log('📊 Status:', adminUser.status);
    console.log('\n🔐 Login Credentials:');
    console.log('Email: admin@gmail.com');
    console.log('Password: Test@123');
    console.log('\n✅ You can login now!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

checkAndCreateAdmin();
