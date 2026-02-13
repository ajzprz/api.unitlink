import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { Amenity } from '../models/Amenity';

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function seedAmenities() {
    try {
        await mongoose.connect(process.env.MONGO_URI || '');
        console.log('Connected to MongoDB');

        const amenities = [
            {
                name: 'Party Room',
                description: 'A spacious room perfect for hosting events and parties.',
                capacity: 100,
                operatingHours: { open: '09:00', close: '02:00' },
                image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
                isActive: true
            },
            {
                name: 'Theatre Room',
                description: 'Private cinema experience with premium sound and seating.',
                capacity: 20,
                operatingHours: { open: '10:00', close: '23:00' },
                image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800',
                isActive: true
            },
            {
                name: 'BBQ Area',
                description: 'Outdoor BBQ stations with dining tables and city views.',
                capacity: 15,
                operatingHours: { open: '11:00', close: '22:00' },
                image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800',
                isActive: true
            }
        ];

        for (const amenity of amenities) {
            await Amenity.findOneAndUpdate(
                { name: amenity.name },
                amenity,
                { upsert: true, new: true }
            );
            console.log(`Ensured amenity: ${amenity.name}`);
        }

        console.log('Amenities seeding complete!');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedAmenities();
