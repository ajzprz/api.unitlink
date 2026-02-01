import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Resident from './models/Resident';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '../.env' });

async function testAuth() {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('Connected to DB');

        const testEmail = 'test-resident@example.com';
        const testPass = 'password123';

        // 1. Clean up
        await Resident.deleteMany({ email: testEmail });

        // 2. Create
        console.log('Creating resident...');
        const resident = await Resident.create({
            unitNumber: '101',
            firstName: 'Test',
            lastName: 'Resident',
            email: testEmail,
            password: testPass,
            contactNumber: '1234567890',
            parkingSpot: 'P-1'
        });

        console.log('Resident created with _id:', resident._id);
        console.log('Hashed password in DB:', resident.password);

        // 3. Test Login Logic (simulate AuthController)
        console.log('Testing login logic...');
        const foundResident = await Resident.findOne({ email: testEmail }).select('+password');

        if (!foundResident) {
            console.error('Resident not found after creation!');
            return;
        }

        const isMatch = await foundResident.correctPassword(testPass, foundResident.password);
        console.log('Password match result:', isMatch);

        const isManualMatch = await bcrypt.compare(testPass, foundResident.password);
        console.log('Manual bcrypt compare result:', isManualMatch);

        if (isMatch) {
            console.log('AUTH SUCCESSFUL');
        } else {
            console.log('AUTH FAILED');
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testAuth();
