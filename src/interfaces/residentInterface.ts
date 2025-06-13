import { ObjectId } from "mongoose";

export interface IResidnetInterface extends Document {
    _id: ObjectId;
    unitNumber: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
    parkingSpot:string;
}