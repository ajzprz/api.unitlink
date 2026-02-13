import mongoose, { Document, Schema } from 'mongoose';

export interface IOccurrenceReport extends Document {
    staffId: mongoose.Types.ObjectId;
    staffName: string;
    reportType: 'daily' | 'special';
    category?: 'general' | 'water leakage' | 'noise complaint' | 'security' | 'maintenance' | 'medical' | 'fire' | 'other';
    date: Date;
    shiftStart?: Date;
    shiftEnd?: Date;
    entries: Array<{
        time: Date;
        description: string;
        _id?: mongoose.Types.ObjectId;
    }>;
    status: 'in-progress' | 'completed';
    createdAt: Date;
    updatedAt: Date;
}

const occurrenceReportSchema = new Schema<IOccurrenceReport>(
    {
        staffId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        staffName: {
            type: String,
            required: true,
        },
        reportType: {
            type: String,
            enum: ['daily', 'special'],
            required: true,
        },
        category: {
            type: String,
            enum: ['general', 'water leakage', 'noise complaint', 'security', 'maintenance', 'medical', 'fire', 'other'],
            default: 'general'
        },
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        shiftStart: {
            type: Date,
        },
        shiftEnd: {
            type: Date,
        },
        entries: [
            {
                time: {
                    type: Date,
                    required: true,
                    default: Date.now,
                },
                description: {
                    type: String,
                    required: true,
                },
            },
        ],
        status: {
            type: String,
            enum: ['in-progress', 'completed'],
            default: 'in-progress',
        },
    },
    { timestamps: true }
);

const OccurrenceReport = mongoose.model<IOccurrenceReport>('OccurrenceReport', occurrenceReportSchema);

export default OccurrenceReport;
