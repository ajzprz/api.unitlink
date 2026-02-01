import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const packageCount = await db.collection('packages').countDocuments();
        const residentCount = await db.collection('residents').countDocuments();
        const unitCount = await db.collection('units').countDocuments();

        console.log(`Units: ${unitCount}`);
        console.log(`Residents: ${residentCount}`);
        console.log(`Packages: ${packageCount}`);

        if (packageCount > 0) {
            const samplePkg = await db.collection('packages').findOne();
            console.log('Sample Package:', samplePkg);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkData();
