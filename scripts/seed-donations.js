require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const supabase = require('../config/supabase');

async function seedDonations() {
  try {
    console.log('🌱 Starting donation data seeding...');

    // 1. Check if test3@gmail.com exists, if not create it
    let { data: donorUser, error: donorCheckError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'test3@gmail.com')
      .single();

    if (donorCheckError && donorCheckError.code !== 'PGRST116') {
      throw donorCheckError;
    }

    if (!donorUser) {
      console.log('Creating donor user test3@gmail.com...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Test@123', 10);

      const { data: newDonor, error: createDonorError } = await supabase
        .from('users')
        .insert([{
          name: 'Test Donor 3',
          email: 'test3@gmail.com',
          password: hashedPassword,
          role: 'donor',
          phone: '9876543210',
          age: 28,
          gender: 'male',
          blood_group: 'B+',
          city: 'Mumbai'
        }])
        .select()
        .single();

      if (createDonorError) throw createDonorError;
      donorUser = newDonor;
      console.log('✅ Created donor user:', donorUser.email);
    } else {
      console.log('✅ Found existing donor user:', donorUser.email);
    }

    // 2. Get a patient user to create donation request
    let { data: patientUser, error: patientError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('role', 'patient')
      .limit(1)
      .single();

    if (patientError && patientError.code !== 'PGRST116') {
      throw patientError;
    }

    if (!patientUser) {
      console.log('Creating patient user for donation requests...');
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('Test@123', 10);

      const { data: newPatient, error: createPatientError } = await supabase
        .from('users')
        .insert([{
          name: 'Test Patient',
          email: 'patient@gmail.com',
          password: hashedPassword,
          role: 'patient',
          phone: '9876543211',
          age: 35,
          gender: 'female',
          blood_group: 'A+',
          city: 'Mumbai'
        }])
        .select()
        .single();

      if (createPatientError) throw createPatientError;
      patientUser = newPatient;
      console.log('✅ Created patient user:', patientUser.email);
    } else {
      console.log('✅ Found existing patient user:', patientUser.email);
    }

    // 3. Create donation requests
    console.log('Creating donation requests...');
    
    const donationRequests = [
      {
        hospital_name: 'KEM Hospital',
        location: 'Parel, Mumbai',
        blood_group: 'B+',
        units_needed: 2,
        urgency_level: 'Critical',
        contact_number: '9876543210',
        notes: 'Urgent blood requirement for surgery patient',
        status: 'active'
      },
      {
        hospital_name: 'Lilavati Hospital',
        location: 'Bandra, Mumbai',
        blood_group: 'A+',
        units_needed: 1,
        urgency_level: 'High',
        contact_number: '9876543211',
        notes: 'Emergency blood transfusion needed',
        status: 'active'
      },
      {
        hospital_name: 'Hinduja Hospital',
        location: 'Mahim, Mumbai',
        blood_group: 'O+',
        units_needed: 3,
        urgency_level: 'Medium',
        contact_number: '9876543212',
        notes: 'Planned surgery next week',
        status: 'active'
      }
    ];

    const { data: requests, error: requestsError } = await supabase
      .from('donation_requests')
      .insert(donationRequests)
      .select();

    if (requestsError) throw requestsError;
    console.log(`✅ Created ${requests.length} donation requests`);

    // 4. Create completed donations
    console.log('Creating donation records...');
    
    const donations = [
      {
        donor_id: donorUser.id,
        request_id: requests[0].id,
        hospital_name: 'KEM Hospital',
        location: 'Parel, Mumbai',
        blood_group: 'B+',
        units: 1,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        donation_id: `DON${Date.now()}001`,
        notes: 'Blood donation completed successfully'
      },
      {
        donor_id: donorUser.id,
        request_id: requests[1].id,
        hospital_name: 'Lilavati Hospital',
        location: 'Bandra, Mumbai',
        blood_group: 'B+',
        units: 2,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        donation_id: `DON${Date.now()}002`,
        notes: 'Emergency donation completed'
      },
      {
        donor_id: donorUser.id,
        request_id: null,
        hospital_name: 'Hinduja Hospital',
        location: 'Mahim, Mumbai',
        blood_group: 'B+',
        units: 1,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        donation_id: `DON${Date.now()}003`,
        notes: 'Regular voluntary donation'
      }
    ];

    const { data: donationRecords, error: donationsError } = await supabase
      .from('donations')
      .insert(donations)
      .select();

    if (donationsError) throw donationsError;
    console.log(`✅ Created ${donationRecords.length} donation records`);

    console.log('\n🎉 Donation data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Donor: ${donorUser.email} (${donorUser.blood_group || 'B+'})`);
    console.log(`   - Patient: ${patientUser.email}`);
    console.log(`   - Donation Requests: ${requests.length}`);
    console.log(`   - Donations: ${donationRecords.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding donation data:', error);
    process.exit(1);
  }
}

seedDonations();
