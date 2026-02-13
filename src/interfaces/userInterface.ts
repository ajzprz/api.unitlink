import { Document, ObjectId } from "mongoose";

export enum UserRole {
    User = "user",
    Admin = "admin",
    Concierge = "concierge",
    Superintendent = "superintendent",
    Cleaner = "cleaner",
    Resident = "resident",
}

export interface IUserDocument extends Document {
    _id: ObjectId;
    name: string;
    email: string;
    password?: string;
    passwordConfirm?: string;
    role: UserRole;
    active: boolean;
    isEmailVerified: boolean;
    emailVerificationOTP?: string;
    emailVerificationOTPExpires?: Date;
    passwordResetOTP?: string;
    passwordResetOTPExpires?: Date;
    googleId?: string;
    needsPasswordChange?: boolean;
    correctPassword(
        candidatePassword: string,
        userPassword: string
    ): Promise<boolean>;
    // generateEmailVerificationOTP(): string;
    // verifyEmailOTP(otp: string): boolean;
    generatePwdVerificationOTP(): string;
    verifyPwdOTP(otp: string): string;
}
