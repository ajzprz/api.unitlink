import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listResidents() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const residents = await db.collection('residents').find({}).toArray();
        console.log('--- ALL RESIDENTS ---');
        residents.forEach(r => {
            console.log(`ID: ${r._id}, Email: "${r.email}", Name: ${r.firstName} ${r.lastName}, Has PW: ${!!r.password}`);
            if (r.password) {
                console.log(`  PW Hash Length: ${r.password.length}`);
            }
        });
        console.log('---------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

listResidents();
