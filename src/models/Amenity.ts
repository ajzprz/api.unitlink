import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Amenity name is required'],
        unique: true
    },
    description: String,
    image: String,
    capacity: Number,
    operatingHours: {
        open: String,
        close: String
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Amenity = mongoose.model('Amenity', amenitySchema);

const amenityBookingSchema = new mongoose.Schema({
    amenityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Amenity',
        required: true
    },
    residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
        required: true
    },
    unitNumber: String,
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    purpose: String
}, { timestamps: true });

export const AmenityBooking = mongoose.model('AmenityBooking', amenityBookingSchema);
