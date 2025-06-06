import { NextFunction, Response } from "express";
import { IUserDocument } from "../interfaces/userInterface.js";
import catchAsync from "../utils/catchAsync.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import AppError from "../utils/appError.js";
import Email from "../utils/email.js";
import { CustomRequest } from "../interfaces/customRequest.js";
import User from "../models/User.js";

class AuthController {
    createSendToken = async (
        user: IUserDocument,
        statusCode: number,
        req: CustomRequest,
        res: Response
    ) => {
        const token = await this.signToken(user._id, user.email, user.role);

        //Remove password from output
        user.set("password", undefined, { strict: false });

        res.status(statusCode).json({
            status: "success",
            user,
            token,
        });
    };

    signup = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            // 1. Check if user already exists
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                return next(new AppError("User already exists!", 400));
            }

            // 2. Create new user
            const newUser = await User.create({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                passwordConfirm: req.body.passwordConfirm
            });

            // 3. Optional: create a JWT token and send it
            const token = this.signToken(newUser._id, newUser.email, newUser.role);

            res.status(201).json({
                status: "success",
                message: "User created successfully.",
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        }
    );


    signToken = (id: ObjectId, email: string, role: string) => {
        return new Promise((resolve, reject) => {
            jwt.sign(
                { id, email, role },
                process.env.JWT_SECRET as jwt.Secret,
                {
                    expiresIn: process.env.JWT_EXPIRES_IN
                } as SignOptions,
                (err, token) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token);
                    }
                }
            );
        });
    };

    verifyToken = (token: string): Promise<jwt.JwtPayload> => {
        return new Promise((resolve, reject) => {
            jwt.verify(
                token,
                process.env.JWT_SECRET as jwt.Secret,
                (err, decoded) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(decoded as jwt.JwtPayload);
                    }
                }
            );
        });
    };

    test = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            res.status(200).json({
                status: "success",
                message: "Test route is working",
            });
        }
    );

    verifyEmail = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            const { email, otp } = req.body;

            //check if email and otp is sent
            if (!email || !otp) {
                return next(new AppError("Please provide both email and otp!!", 400));
            }

            //Check if user exist in DB
            const user = await User.findOne({ email });
            if (!user) {
                return next(new AppError("User not found", 404));
            }

            // //Verify email otp
            // if (!user.verifyEmailOTP(otp)) {
            //     return next(new AppError("Invalid or expired OTP. Try Again!!", 400));
            // }

            //delete otps, its not needed now
            user.isEmailVerified = true;
            user.emailVerificationOTP = undefined;
            user.emailVerificationOTPExpires = undefined;
            await user.save({ validateBeforeSave: false });

            //Everything ok? send response
            res.status(200).json({
                status: "success",
                message: "Email verified successfully.",
            });
        }
    );

    login = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            const { email, password } = req.body;

            //Check if email and password exist
            if (!email || !password) {
                return next(new AppError("Please provide email and password!", 400));
            }

            //check if user exist and password is correct
            const user = await User.findOne({ email }).select("+password");

            if (
                !user ||
                !(await user.correctPassword(password, user.password as string))
            ) {
                return next(new AppError("Incorrect email or password", 422));
            }

            //check email verification
            // if (!user.isEmailVerified) {
            //     return next(new AppError("Please verify your email first", 403));
            // }

            //If everything of send response
            await this.createSendToken(user, 200, req, res);
        }
    );

    protect = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            //check if token present or not
            let token;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith("Bearer")
            ) {
                token = req.headers.authorization.split(" ")[1];
            }

            if (!token || token === null) {
                return next(new AppError("User not logged in!", 401));
            }

            //verify token
            const decoded = await this.verifyToken(token);

            //check if user still exist
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next(
                    new AppError(
                        "The user belonging to this token does no longer exist.",
                        401
                    )
                );
            }

            //check if email is verified
            if (!freshUser.isEmailVerified) {
                return next(new AppError("Please verify your email first", 403));
            }

            //Remainng to check if user changed password after the token was issued---------------

            //Grant acces to protected route
            req.user = freshUser;
            return next();
        }
    );

    restrictTo = (roles: string[]) => {
        return (req: CustomRequest, res: Response, next: NextFunction) => {
            if (!roles.includes(req.user?.role as string)) {
                return next(
                    new AppError("You do not have permission to perform this action", 403)
                );
            }
            next();
        };
    };

    forgotPassword = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            //Check if email is sent
            const { email } = req.body;
            if (!email) return next(new AppError("Please provide email", 404));

            //Get user based on posted email
            const user = await User.findOne({ email });
            if (!user) {
                return next(new AppError("There is no user with email address", 404));
            }

            //Generate random otp for pwd verification
            const otp = user.generatePwdVerificationOTP();

            try {
                //send otp to user Email
                // await new Email(user).sendPwdResetOTP(otp);

                await user.save({ validateBeforeSave: false });

                res.status(200).json({
                    status: "success",
                    message: "OTP sent to email",
                });
            } catch (err) {
                user.passwordResetOTP = undefined;
                user.passwordResetOTPExpires = undefined;

                await user.save({ validateBeforeSave: false });

                return next(
                    new AppError(
                        "There was an error sending the email. Try again later!",
                        500
                    )
                );
            }
        }
    );

    resetPassword = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            const { email, otp, newPassword } = req.body;

            //check if email, otp and newPassword is sent
            if (!email || !otp || !newPassword) {
                return next(
                    new AppError(
                        "Please provide all the fields email, otp and new password!!",
                        400
                    )
                );
            }

            //Check if user exist in DB
            const user = await User.findOne({ email });
            if (!user) {
                return next(new AppError("User not found", 404));
            }

            //Verify pwd reset otp
            if (!user.verifyPwdOTP(otp)) {
                return next(new AppError("Invalid or expired OTP. Try Again!!", 400));
            }

            user.password = newPassword;
            user.passwordConfirm = newPassword;
            user.passwordResetOTP = undefined;
            user.passwordResetOTPExpires = undefined;
            await user.save();

            res.status(201).json({
                status: "success",
                message: "Password reset successfully.",
                data: user,
            });
        }
    );

    updatePassword = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            // Check if password and confirm password is sent
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            if (!currentPassword || !newPassword || !confirmNewPassword) {
                return next(
                    new AppError(
                        "Please provide all fields, current password, new password and confirm new password",
                        400
                    )
                );
            }
            //Get user from collection
            const user = await User.findById(req.user?._id).select("+password");

            //check if current posted password is correct
            if (
                !(await user?.correctPassword(
                    currentPassword,
                    user?.password as string
                ))
            ) {
                return next(new AppError("Your current password is wrong.", 400));
            }

            if (user) {
                //update the password
                user.password = newPassword;
                user.passwordConfirm = confirmNewPassword;
                await user.save();

                //Log the user in and send token
                this.createSendToken(user, 200, req, res);
            }
        }
    );

    getMe = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            //Check if user is present
            if (!req.user) {
                return next(new AppError("User not authenticated", 401));
            }

            //get user id
            const userId = req?.user._id;

            //get user data
            const user = await User.findById(userId);

            res.status(200).json({
                status: "success",
                data: user,
            });
        }
    );

    logOut = (req: CustomRequest, res: Response, next: NextFunction) => {
        // Clear the JWT cookie
        res.cookie("jwt", "loggedout", {
            expires: new Date(Date.now() + 10 * 1000), // Set cookie to expire in 10 seconds
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        });

        res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    }

}

// Exporting an instance of the TourController class
const authController = new AuthController();
export default authController;