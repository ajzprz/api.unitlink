import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from './models/User';
import Resident from './models/Resident';
import Unit from './models/Units';
import Package from './models/Packages';
import { Announcement } from './models/Announcement';
import { Amenity, AmenityBooking } from './models/Amenity';
import { Posting } from './models/Posting';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        // 1. Clear Data
        console.log('Clearing old data...');
        await Promise.all([
            User.deleteMany({}),
            Resident.deleteMany({}),
            Unit.deleteMany({}),
            Package.deleteMany({}),
            Announcement.deleteMany({}),
            Amenity.deleteMany({}),
            AmenityBooking.deleteMany({}),
            Posting.deleteMany({})
        ]);

        // 2. Seed Admin
        console.log('Seeding Admin...');
        await User.create({
            name: 'System Admin',
            email: 'admin@unitlink.com',
            password: 'password123',
            passwordConfirm: 'password123',
            role: 'admin',
            active: true
        });

        // 3. Seed Units
        console.log('Seeding Units...');
        const units = [];
        for (let floor = 1; floor <= 5; floor++) {
            for (let room = 1; room <= 4; room++) {
                const unitNumber = `${floor}${room.toString().padStart(2, '0')}`;
                units.push({
                    unitNumber,
                    floor,
                    buildingName: 'Nexus Tower A',
                    ownerName: `Owner ${unitNumber}`,
                    ownerEmail: `owner${unitNumber}@example.com`,
                    contactNumber: `123456${unitNumber}`,
                    isOccupied: room <= 2, // 50% occupancy
                    parkingSpot: `P-${unitNumber}`,
                    lockerNumber: `L-${unitNumber}`
                });
            }
        }
        await Unit.insertMany(units);

        // 4. Seed Residents (for occupied units)
        console.log('Seeding Residents...');
        const residents = [];
        const occupiedUnits = units.filter(u => u.isOccupied);
        for (const unit of occupiedUnits) {
            residents.push({
                unitNumber: unit.unitNumber,
                firstName: 'Resident',
                lastName: `of ${unit.unitNumber}`,
                email: `res${unit.unitNumber}@example.com`,
                password: 'password123', // Will be hashed by pre-save
                contactNumber: unit.contactNumber,
                parkingSpot: unit.parkingSpot,
                lockerNumber: unit.lockerNumber,
                role: 'resident',
                needsPasswordChange: true
            });
        }
        // Need to use .create to trigger pre-save hashing
        for (const resData of residents) {
            await Resident.create(resData);
        }

        // 5. Seed Packages
        console.log('Seeding Packages...');
        const resList = await Resident.find();
        const packages = [];
        for (let i = 0; i < 10; i++) {
            const res = resList[i % resList.length];
            packages.push({
                unitNumber: res.unitNumber,
                userId: res._id,
                carrier: i % 2 === 0 ? 'FedEx' : 'Amazon',
                packageType: i % 3 === 0 ? 'Box' : 'Envelope',
                status: i < 7 ? 'pending' : 'collected',
                pickedUpBy: i < 7 ? '' : res.firstName,
                receivedBy: 'Receptionist'
            });
        }
        await Package.insertMany(packages);

        // 6. Seed Amenities
        console.log('Seeding Amenities...');
        await Amenity.insertMany([
            { name: 'Sky Lounge', capacity: 50, operatingHours: { open: '08:00', close: '23:00' }, isActive: true },
            { name: 'Executive Gym', capacity: 15, operatingHours: { open: '00:00', close: '23:59' }, isActive: true },
            { name: 'Theater Room', capacity: 10, operatingHours: { open: '10:00', close: '00:00' }, isActive: true },
            { name: 'Swimming Pool', capacity: 30, operatingHours: { open: '06:00', close: '22:00' }, isActive: true }
        ]);

        // 7. Seed Announcements
        console.log('Seeding Announcements...');
        await Announcement.insertMany([
            { title: 'Annual Fire Inspection', content: 'Fire inspections will take place next Monday at 10 AM. Please ensure access to all units.', category: 'maintenance', author: 'Management' },
            { title: 'New Pool Hours', content: 'The pool will now be open until 10 PM on weekends.', category: 'general', author: 'Management' },
            { title: 'Community BBQ', content: 'Join us for a BBQ at the terrace this Sunday!', category: 'event', author: 'Social Committee' }
        ]);

        console.log('Seeding Complete! 🎉');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding Failed:', error);
        process.exit(1);
    }
}

seed();
