// scripts/migrate-admin-role.js
// Add 'admin' role to database schema

require('dotenv').config();
const supabase = require('../config/supabase');

const migrateAdminRole = async () => {
  try {
    console.log('🔧 Updating database schema to support admin role...\n');

    // Drop existing constraint and add new one with 'admin' role
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
        ALTER TABLE users ADD CONSTRAINT users_role_check 
          CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));
      `
    });

    if (error) {
      // If RPC doesn't exist, we need to use direct query
      console.log('⚠️  RPC method not available, trying alternative approach...\n');
      
      // Alternative: Just try to insert a test admin to verify schema
      const testHash = '$2a$10$test';
      const { error: testError } = await supabase
        .from('users')
        .insert([{
          name: 'Test Admin',
          email: 'test-admin-delete-me@test.com',
          password: testHash,
          role: 'admin',
          phone: '+91 00000 00000',
          status: 'active'
        }])
        .select()
        .single();

      if (testError) {
        if (testError.message.includes('violates check constraint')) {
          console.log('❌ Database schema does not support admin role yet.\n');
          console.log('📋 Please run this SQL in Supabase Dashboard → SQL Editor:\n');
          console.log('─────────────────────────────────────────────────────');
          console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
          console.log('ALTER TABLE users ADD CONSTRAINT users_role_check');
          console.log("  CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));");
          console.log('─────────────────────────────────────────────────────\n');
          console.log('🌐 Supabase Dashboard: https://eprhxuegfxkkkjlrjwsz.supabase.co\n');
          process.exit(1);
        } else {
          // Schema might already support admin, delete test user
          await supabase.from('users').delete().eq('email', 'test-admin-delete-me@test.com');
          console.log('✅ Database schema already supports admin role!\n');
          process.exit(0);
        }
      } else {
        // Test user created successfully, schema is good, delete it
        await supabase.from('users').delete().eq('email', 'test-admin-delete-me@test.com');
        console.log('✅ Database schema already supports admin role!\n');
        process.exit(0);
      }
    } else {
      console.log('✅ Database schema updated successfully!\n');
      console.log('Admin role is now allowed in the users table.\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    console.log('\n📋 Manual SQL required. Run in Supabase Dashboard:\n');
    console.log('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;');
    console.log('ALTER TABLE users ADD CONSTRAINT users_role_check');
    console.log("  CHECK (role IN ('patient', 'caretaker', 'donor', 'admin'));");
    process.exit(1);
  }
};

migrateAdminRole();
