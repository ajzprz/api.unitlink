import { ObjectId } from "mongoose";

export interface IResidnetInterface extends Document {
    _id: ObjectId;
    unitNumber: Number;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email: string;
}