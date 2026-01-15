// Test script for Admin Patient & Caretaker Management APIs
require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Test@123';

let adminToken = '';

async function loginAsAdmin() {
  try {
    console.log('\n🔐 Logging in as admin...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    adminToken = response.data.token;
    console.log('✅ Admin login successful');
    console.log('User:', response.data.user.email, '-', response.data.user.role);
    return true;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllPatients() {
  try {
    console.log('\n📋 Testing GET /api/admin/patients...');
    const response = await axios.get(`${BASE_URL}/admin/patients?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log(`Found ${response.data.data.length} patients`);
    console.log('Pagination:', response.data.pagination);
    
    if (response.data.data.length > 0) {
      console.log('\nFirst patient:');
      console.log(response.data.data[0]);
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testGetPatientById(patientId) {
  try {
    console.log(`\n👤 Testing GET /api/admin/patients/${patientId}...`);
    const response = await axios.get(`${BASE_URL}/admin/patients/${patientId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Patient:', response.data.data.name);
    console.log('Stats:', response.data.data.stats);
    console.log('Caretakers:', response.data.data.caretakers.length);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testGetPatientMedications(patientId) {
  try {
    console.log(`\n💊 Testing GET /api/admin/patients/${patientId}/medications...`);
    const response = await axios.get(`${BASE_URL}/admin/patients/${patientId}/medications`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log(`Found ${response.data.data.medications.length} medications`);
    
    if (response.data.data.medications.length > 0) {
      console.log('First medication:', response.data.data.medications[0].name);
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testGetPatientAdherence(patientId) {
  try {
    console.log(`\n📊 Testing GET /api/admin/patients/${patientId}/adherence...`);
    const response = await axios.get(`${BASE_URL}/admin/patients/${patientId}/adherence?days=30`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Statistics:', response.data.data.statistics);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testGetAllCaretakers() {
  try {
    console.log('\n👥 Testing GET /api/admin/caretakers...');
    const response = await axios.get(`${BASE_URL}/admin/caretakers?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log(`Found ${response.data.data.length} caretakers`);
    
    if (response.data.data.length > 0) {
      console.log('\nFirst caretaker:');
      console.log(`${response.data.data[0].name} - ${response.data.data[0].patientCount} patients`);
    }
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testGetCaretakerById(caretakerId) {
  try {
    console.log(`\n👥 Testing GET /api/admin/caretakers/${caretakerId}...`);
    const response = await axios.get(`${BASE_URL}/admin/caretakers/${caretakerId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Caretaker:', response.data.data.name);
    console.log('Stats:', response.data.data.stats);
    console.log('Assigned patients:', response.data.data.patients.length);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testAssignPatientToCaretaker(caretakerId, patientId) {
  try {
    console.log(`\n🔗 Testing POST /api/admin/links (assign patient to caretaker)...`);
    const response = await axios.post(`${BASE_URL}/admin/links`, {
      caretaker_id: caretakerId,
      patient_id: patientId
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Message:', response.data.message);
    console.log('Link ID:', response.data.data.id);
    return response.data.data.id;
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return null;
  }
}

async function testRemoveLink(linkId) {
  try {
    console.log(`\n🔓 Testing DELETE /api/admin/links/${linkId}...`);
    const response = await axios.delete(`${BASE_URL}/admin/links/${linkId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Message:', response.data.message);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function testUpdatePatient(patientId) {
  try {
    console.log(`\n✏️ Testing PATCH /api/admin/patients/${patientId}...`);
    const response = await axios.patch(`${BASE_URL}/admin/patients/${patientId}`, {
      city: 'Updated City'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Updated patient:', response.data.data.name);
    console.log('New city:', response.data.data.city);
  } catch (error) {
    console.error('❌ Failed:', error.response?.data || error.message);
  }
}

async function getFirstPatientAndCaretaker() {
  try {
    // Get first patient
    const patientsRes = await axios.get(`${BASE_URL}/admin/patients?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    // Get first caretaker
    const caretakersRes = await axios.get(`${BASE_URL}/admin/caretakers?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    return {
      patientId: patientsRes.data.data[0]?.id,
      caretakerId: caretakersRes.data.data[0]?.id
    };
  } catch (error) {
    console.error('Error getting test data:', error.message);
    return { patientId: null, caretakerId: null };
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Admin Patient & Caretaker Management API Test Suite     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  // Login
  const loginSuccess = await loginAsAdmin();
  if (!loginSuccess) {
    console.log('\n❌ Cannot proceed without admin authentication');
    return;
  }
  
  // Get test IDs
  const { patientId, caretakerId } = await getFirstPatientAndCaretaker();
  
  // Run tests
  await testGetAllPatients();
  
  if (patientId) {
    await testGetPatientById(patientId);
    await testGetPatientMedications(patientId);
    await testGetPatientAdherence(patientId);
    await testUpdatePatient(patientId);
  } else {
    console.log('\n⚠️ No patients found, skipping patient-specific tests');
  }
  
  await testGetAllCaretakers();
  
  if (caretakerId) {
    await testGetCaretakerById(caretakerId);
  } else {
    console.log('\n⚠️ No caretakers found, skipping caretaker-specific tests');
  }
  
  // Test link management
  if (patientId && caretakerId) {
    const linkId = await testAssignPatientToCaretaker(caretakerId, patientId);
    if (linkId) {
      await testRemoveLink(linkId);
    }
  } else {
    console.log('\n⚠️ Missing patient or caretaker, skipping link tests');
  }
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                  All Tests Completed!                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Run all tests
runAllTests().catch(console.error);
