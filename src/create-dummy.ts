import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Resident from './models/Resident';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createDummy() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const email = 'dummy@nexusops.com';
        const pass = 'Nexus@2024';

        await Resident.deleteMany({ email });

        console.log('Creating dummy resident...');
        const res = await Resident.create({
            unitNumber: '999',
            firstName: 'Dummy',
            lastName: 'User',
            email: email,
            password: pass,
            contactNumber: '0000000000',
            parkingSpot: 'D-999',
            role: 'resident'
        });

        console.log('Dummy Resident Created:');
        console.log(`Email: ${res.email}`);
        console.log(`Password (Plain): ${pass}`);
        console.log(`Password (Hashed): ${res.password}`);

        // Test immediate logic check
        const found = await Resident.findOne({ email }).select('+password');
        const isMatch = await found?.correctPassword(pass, found.password);
        console.log(`Internal Check Match: ${isMatch}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

createDummy();
