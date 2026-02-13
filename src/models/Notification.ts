import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['amenity_status', 'amenity_request', 'package', 'announcement', 'general'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Notification = mongoose.model('Notification', notificationSchema);
