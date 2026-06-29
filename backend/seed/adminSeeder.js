import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Admin from '../models/Admin.js';
import connectDB from '../config/database.js';

// Load env vars from parent directory (.env)
dotenv.config({ path: path.join(process.cwd(), '.env') });

const seedAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Checking for existing administrator accounts...');
    const adminCount = await Admin.countDocuments();

    if (adminCount === 0) {
      console.log('No administrator accounts found. Creating default administrator...');

      const defaultAdmin = await Admin.create({
        name: 'TechForge Admin',
        email: process.env.ADMIN_EMAIL || 'admin@techforge.com',
        password: process.env.ADMIN_PASSWORD || 'AdminPassword123'
      });

      console.log('----------------------------------------------------');
      console.log('Default Administrator Created Successfully:');
      console.log(`Email: ${defaultAdmin.email}`);
      console.log('Password: (specified in .env or default: AdminPassword123)');
      console.log('----------------------------------------------------');
    } else {
      console.log(`Admin accounts already exist (${adminCount} found). Seeding skipped.`);
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
