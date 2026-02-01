import mongoose, { Document, Schema } from "mongoose";

export interface IPackage extends Document {
    userId: string; // Resident's _id
    unitNumber: string; // Redundant but good for quick lookup
    packageType: string; // Small Box, Envelope, Large Box, etc.
    carrier: string; // Amazon, FedEx, UPS, DHL, Private Courier, etc.
    description?: string; // Optional delivery notes
    receivedBy: string; // Concierge/Admin Name
    pickedUpBy?: string; // Name of person who picked it up
    status: 'pending' | 'collected';
    collectedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const PackageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Resident', required: true },
    unitNumber: { type: String, required: true },
    packageType: { type: String, required: true },
    carrier: { type: String, required: true },
    description: { type: String },
    receivedBy: { type: String, required: true },
    pickedUpBy: { type: String },
    status: {
        type: String,
        enum: ['pending', 'collected'],
        default: 'pending'
    },
    collectedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


const Package = mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema);

export default Package;