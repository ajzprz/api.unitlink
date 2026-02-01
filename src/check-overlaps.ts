import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) throw new Error('DB not found');

        const users = await db.collection('users').find({}).toArray();
        const residents = await db.collection('residents').find({}).toArray();

        console.log(`Checking duplicates for ${users.length} users and ${residents.length} residents`);

        const userEmails = new Set(users.map(u => u.email.toLowerCase()));
        const overlaps = residents.filter(r => userEmails.has(r.email.toLowerCase()));

        if (overlaps.length > 0) {
            console.log('CRITICAL: Emails found in BOTH collections!');
            overlaps.forEach(o => console.log(` - ${o.email}`));
        } else {
            console.log('No email overlaps found.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDuplicates();
