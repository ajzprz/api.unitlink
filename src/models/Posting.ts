import mongoose from 'mongoose';

const postingSchema = new mongoose.Schema({
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: Number,
    category: {
        type: String,
        enum: ['parking', 'locker', 'furniture', 'other'],
        required: true
    },
    contactInfo: String,
    image: String,
    status: {
        type: String,
        enum: ['active', 'sold', 'expired'],
        default: 'active'
    }
}, { timestamps: true });

export const Posting = mongoose.model('Posting', postingSchema);
