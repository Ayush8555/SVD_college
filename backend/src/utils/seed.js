import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';

dotenv.config();

/**
 * Database Seed Script - SVD Gurukul Mahavidyalaya
 * Run with: npm run seed
 * 
 * This script only creates the initial admin account.
 * Students and results should be added through the admin portal.
 */

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding for SVD Gurukul...\n');

    if(!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({});
    
    if (existingAdmin) {
        console.log('ℹ️  Admin account already exists. Skipping admin creation.\n');
        console.log('--------------------------------------------------');
        console.log('Existing Admin Details:');
        console.log(`Email: ${existingAdmin.email}`);
        console.log(`Employee ID: ${existingAdmin.employeeId}`);
        console.log('--------------------------------------------------');
        process.exit(0);
    }

    // Create Admin from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminEmployeeId = process.env.ADMIN_EMPLOYEE_ID;
    
    if (!adminPassword || !adminEmployeeId) {
        throw new Error('ADMIN_PASSWORD and ADMIN_EMPLOYEE_ID must be set in .env file');
    }
    
    await Admin.create({
        firstName: 'Principal',
        lastName: 'Office',
        email: 'admin@svdgurukul.edu.in',
        password: adminPassword, 
        designation: 'Principal',
        employeeId: adminEmployeeId,
        role: 'admin'
    });
    
    console.log('� Created Admin Account\n');
    console.log('✨ SVD Gurukul Database Setup Complete!');
    console.log('--------------------------------------------------');
    console.log('Admin Login Details:');
    console.log('URL:         /admin/login');
    console.log(`Employee ID: ${adminEmployeeId}`);
    console.log('Password:    [Set in .env file]');
    console.log('--------------------------------------------------');
    console.log('\n📝 Note: Add students and results through the Admin Portal.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
