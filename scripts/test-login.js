// Test script to verify login endpoint works
// Run: node scripts/test-login.js

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://med-backend-gq6h.onrender.com/api'
  : 'http://localhost:10000/api';

async function testLogin(email, password, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log(`   Email: ${email}`);
  
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    console.log(`   ✅ SUCCESS!`);
    console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
    console.log(`   User: ${response.data.user.name}`);
    console.log(`   Role: ${response.data.user.role}`);
    return true;
  } catch (error) {
    console.log(`   ❌ FAILED!`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Message: ${error.response.data.message || error.response.data}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════');
  console.log('          LOGIN ENDPOINT TEST');
  console.log('═══════════════════════════════════════════════════');
  console.log(`API URL: ${API_URL}`);
  
  // Test existing demo users
  await testLogin('patient@demo.com', 'Demo@123', 'Patient Demo User');
  await testLogin('caretaker@demo.com', 'Demo@123', 'Caretaker Demo User');
  await testLogin('donor@demo.com', 'Demo@123', 'Donor Demo User');
  
  // Test admin (will fail if not created)
  await testLogin('admin@gmail.com', 'Test@123', 'Admin User');
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log('          TEST COMPLETE');
  console.log('═══════════════════════════════════════════════════\n');
}

runTests();
