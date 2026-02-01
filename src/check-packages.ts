import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkPackages() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const packages = await db.collection('packages').find({}).toArray();
        console.log(`--- PACKAGES (${packages.length}) ---`);
        for (const p of packages) {
            const res = await db.collection('residents').findOne({ _id: p.userId });
            console.log(`Pkg ID: ${p._id}, Unit: ${p.unitNumber}, Status: ${p.status}, Resident Found: ${!!res} (${res?.email})`);
        }
        console.log('---------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPackages();
