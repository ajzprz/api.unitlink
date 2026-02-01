import { Document } from "mongoose";

export interface UnitInterface extends Document {
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
    lockerNumber?: string;

    maintenanceNotes?: string;
    lastInspection?: Date;
    maintenanceStatus?: string;

    createdAt?: Date;
    updatedAt?: Date;
} 