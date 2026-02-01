import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['maintenance', 'event', 'general', 'emergency'],
        default: 'general'
    },
    image: String,
    author: String,
    isPublished: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Announcement = mongoose.model('Announcement', announcementSchema);
