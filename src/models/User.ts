import mongoose, { Query, Document } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { IUserDocument, UserRole } from "../interfaces/userInterface.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

//user schema
const userSchema = new mongoose.Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email"],
    },
    password: {
      type: String,
      required: [
        function (this: IUserDocument) {
          return !this.googleId; // Password is required only if googleId is not present
        },
        "Password is required",
      ],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [
        function (this: IUserDocument) {
          return !this.googleId; // Password is required only if googleId is not present
        },
        "Please confirm your password",
      ],
      validate: {
        //This only works on create and save!!!
        validator: function (this: any, el: string) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.User,
    },
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // This allows the field to be unique but not required
    },
    needsPasswordChange: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

userSchema.plugin(mongooseAggregatePaginate as any);

//Middleware to hash the password
userSchema.pre("save", async function (next) {
  //Only run this function if password is modified
  if (!this.isModified("password")) return next();

  //hash the password with cost of 12
  if (this.password) this.password = await bcrypt.hash(this.password, 12);

  //Deleting the passwordConfirm since it is not needed
  this.set("passwordConfirm", undefined);
  next();
});

//Middleare to fetch only active users
userSchema.pre<Query<any, Document>>(/^find/, async function (next) {
  //this points the current query
  this.find({ active: { $ne: false } });
  next();
});

//Creating function for checking correct password
userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

//Function to generate otp for email verification
userSchema.methods.generateEmailVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.emailVerificationOTP = otp;
  this.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  return otp;
};

//Function to generate otp for pwd verification
userSchema.methods.generatePwdVerificationOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  this.passwordResetOTP = otp;
  this.passwordResetOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP expires in 10 minutes
  return otp;
};

//verify password reset otp
userSchema.methods.verifyPwdOTP = function (otp: string) {
  return (
    this.passwordResetOTP === otp && this.passwordResetOTPExpires > new Date()
  );
};

//verify email otp
// userSchema.methods.verifyEmailOTP = function (otp: string) {
//   return (
//     this.emailVerificationOTP === otp &&
//     this.emailVerificationOTPExpires > new Date()
//   );
// };

const User = mongoose.model("User", userSchema);
export default User;