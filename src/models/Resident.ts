import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { IResidnetInterface } from "../interfaces/residentInterface";

const residentSchema = new mongoose.Schema<IResidnetInterface>({
    unitNumber: {
        type: String,
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
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "please provide a valid email"],
    },
    contactNumber: {
        type: String,
        validate: [validator.isMobilePhone, "please provide a valid phone number"],
    },
    parkingSpot: {
        type: String,
        default: 'N/A'
    },
    lockerNumber: {
        type: String,
        default: 'N/A'
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
        minlength: 6,
        select: false // Don't return password by default
    },
    role: {
        type: String,
        default: 'resident'
    },
    needsPasswordChange: {
        type: Boolean,
        default: true
    },
    passwordChangedAt: Date
}, { timestamps: true })

// Hash password before saving
residentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Update passwordChangedAt when password is changed
residentSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = new Date(Date.now() - 1000); // 1s early to avoid token edge cases
    next();
});

residentSchema.methods.correctPassword = async function (
    candidatePassword: string,
    userPassword: string
): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const Resident = mongoose.model("Resident", residentSchema)
export default Resident;
