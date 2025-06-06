import mongoose from "mongoose";

export interface IPackage extends Document {
    userId: string; // Assuming this is a reference to a User mode
    name: string;
    description: string;
    deliveredBy: string;
    createdAt: Date;
    updatedAt: Date;
}

const PackageSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    deliveredBy: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Package = mongoose.model("Package", PackageSchema);

export default mongoose.model<IPackage>('Package', PackageSchema);