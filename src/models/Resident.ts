import mongoose from "mongoose";
import validator from "validator";
import { IResidnetInterface } from "../interfaces/residentInterface";

const residentSchema = new mongoose.Schema<IResidnetInterface>({
    unitNumber: {
        type: Number,
        required: [true, 'please enter valid unit number']
    },
    firstName: {
        type: String,
        required: [true, 'please enter your first name']
    },
    lastName: {
        type: String,
        required: [true, 'please enter your last name']
    },
    email: {
        type: String,
        validate: [validator.isEmail, "please provide a valid email"],
    },
    contactNumber: {
        type: String,
        validate: [validator.isMobilePhone, "please provide a valid phone number"],
    }
}
)

const Resident = mongoose.model("Resident", residentSchema)
export default Resident;