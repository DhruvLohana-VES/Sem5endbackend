const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');
const Medication = require('../models/Medication.model');
const Dose = require('../models/Dose.model');
const Link = require('../models/Link.model');
const Notification = require('../models/Notification.model');
const DonationRequest = require('../models/DonationRequest.model');
const Donation = require('../models/Donation.model');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Medication.deleteMany({});
    await Dose.deleteMany({});
    await Link.deleteMany({});
    await Notification.deleteMany({});
    await DonationRequest.deleteMany({});
    await Donation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create Users
    const hashedPassword = await bcrypt.hash('Demo@123', 10);

    const caretaker = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'caretaker@demo.com',
      password: hashedPassword,
      role: 'caretaker',
      phone: '+91 98765 43210'
    });

    const patient = await User.create({
      name: 'Amit Sharma',
      email: 'patient@demo.com',
      password: hashedPassword,
      role: 'patient',
      phone: '+91 87654 32109',
      age: 45,
      gender: 'male',
      adherenceRate: 85
    });

    const donor = await User.create({
      name: 'Vikram Singh',
      email: 'donor@demo.com',
      password: hashedPassword,
      role: 'donor',
      phone: '+91 98123 45678',
      bloodGroup: 'O+',
      dateOfBirth: new Date('1995-03-15'),
      city: 'Mumbai',
      address: '123 Main Street, Andheri West, Mumbai 400053',
      isAvailable: true,
      totalDonations: 8
    });

    console.log('👥 Created users');

    // Create Link
    await Link.create({
      caretakerId: caretaker._id,
      patientId: patient._id,
      invitedEmail: patient.email,
      status: 'accepted'
    });

    console.log('🔗 Created patient-caretaker link');

    // Create Medications
    const medication1 = await Medication.create({
      patientId: patient._id,
      caretakerId: caretaker._id,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'twice daily',
      timing: ['08:00', '20:00'],
      instructions: 'Take with meals to manage blood sugar',
      startDate: new Date('2025-09-15'),
      isActive: true
    });

    const medication2 = await Medication.create({
      patientId: patient._id,
      caretakerId: caretaker._id,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once daily',
      timing: ['09:00'],
      instructions: 'Take in the morning for blood pressure',
      startDate: new Date('2025-09-15'),
      isActive: true
    });

    console.log('💊 Created medications');

    // Create Doses for today
    const today = new Date();
    today.setHours(8, 0, 0, 0);

    const dose1 = await Dose.create({
      medicationId: medication1._id,
      patientId: patient._id,
      scheduledTime: new Date(today),
      status: 'taken',
      takenAt: new Date(today.getTime() + 15 * 60000)
    });

    const dose2 = await Dose.create({
      medicationId: medication1._id,
      patientId: patient._id,
      scheduledTime: new Date(today.setHours(20, 0, 0, 0)),
      status: 'pending'
    });

    const dose3 = await Dose.create({
      medicationId: medication2._id,
      patientId: patient._id,
      scheduledTime: new Date(today.setHours(9, 0, 0, 0)),
      status: 'taken',
      takenAt: new Date(today.getTime() + 5 * 60000)
    });

    console.log('📅 Created doses');

    // Create Notifications
    await Notification.create({
      userId: patient._id,
      type: 'dose_reminder',
      message: 'Time to take Metformin 500mg at 8:00 PM',
      isRead: false
    });

    await Notification.create({
      userId: caretaker._id,
      type: 'patient_linked',
      message: `${patient.name} has accepted your invitation`,
      isRead: false
    });

    console.log('🔔 Created notifications');

    // Create Donation Requests
    await DonationRequest.create({
      hospitalName: 'Lilavati Hospital',
      location: 'Bandra West, Mumbai',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      urgencyLevel: 'High',
      contactNumber: '+91 22 2640 5000',
      notes: 'Urgent! Patient scheduled for emergency surgery.',
      status: 'active'
    });

    await DonationRequest.create({
      hospitalName: 'Breach Candy Hospital',
      location: 'Bhulabhai Desai Road, Mumbai',
      bloodGroup: 'O+',
      unitsNeeded: 1,
      urgencyLevel: 'Medium',
      contactNumber: '+91 22 2367 3888',
      notes: 'Required for post-operative care.',
      status: 'active'
    });

    console.log('🩸 Created donation requests');

    // Create Sample Donations
    await Donation.create({
      donorId: donor._id,
      hospitalName: 'KEM Hospital',
      location: 'Parel, Mumbai',
      bloodGroup: 'O+',
      units: 1,
      date: new Date('2024-10-20'),
      donationId: 'DON-2024-087',
      notes: 'Regular donation drive'
    });

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Caretaker: caretaker@demo.com / Demo@123');
    console.log('Patient: patient@demo.com / Demo@123');
    console.log('Donor: donor@demo.com / Demo@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
