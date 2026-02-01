import { ObjectId, Document } from "mongoose";

export interface IResidnetInterface extends Document {
    _id: ObjectId;
    unitNumber: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    parkingSpot: string;
    lockerNumber: string;
    password: string;
    role: string;
    needsPasswordChange: boolean;
    passwordChangedAt?: Date;
    correctPassword: (candidatePassword: string, userPassword: string) => Promise<boolean>;
}
