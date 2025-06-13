import { ObjectId } from "mongoose";

export interface UnitInterface extends Document {
    _id?: ObjectId; // optional if not yet saved
    unitNumber: string;
    floor?: number;
    buildingName?: string;

    ownerName: string;
    ownerEmail: string;
    contactNumber: string;

    isOccupied?: boolean;
    isRented?: boolean;

    hasParking?: boolean;
    parkingSpot?: string;

    maintenanceNotes?: string;
    lastInspection?: Date;
    maintenanceStatus?: string;

    createdAt?: Date;
    updatedAt?: Date;
} 