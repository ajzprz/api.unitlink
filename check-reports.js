import mongoose from 'mongoose';
import dotenv from 'dotenv';
import OccurrenceReport from './src/models/OccurrenceReport.js';

dotenv.config();

const checkReports = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/unitlink');
        console.log('Connected to DB');
        
        const reports = await OccurrenceReport.find();
        console.log('Total Reports found:', reports.length);
        reports.forEach(r => {
            console.log(`- Report: ${r._id}, Staff: ${r.staffName}, Type: ${r.reportType}, Status: ${r.status}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

checkReports();
