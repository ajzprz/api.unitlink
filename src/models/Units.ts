import mongoose from "mongoose";
import { UnitInterface } from "../interfaces/unitInterface";

const unitSchema = new mongoose.Schema<UnitInterface>({
    unitNumber: { type: String, required: true },
    floor: Number,
    buildingName: String,

    // Ownership info
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    contactNumber: { type: String, required: true },

    // Status info
    isOccupied: { type: Boolean, default: false },
    isRented: { type: Boolean, default: false },

    // Parking & maintenance
    hasParking: Boolean,
    parkingSpot: String,
    lockerNumber: String,
    maintenanceNotes: String,
    lastInspection: Date,
    maintenanceStatus: String, // "Pending", "Completed", etc.

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

const Unit = mongoose.model("Unit", unitSchema)
export default Unit;