import { NextFunction, Response, Request } from "express";
import { IUserDocument } from "../interfaces/userInterface.js";
import { IResidnetInterface } from "../interfaces/residentInterface.js";
import catchAsync from "../utils/catchAsync.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { ObjectId } from "mongoose";
import AppError from "../utils/appError.js";
import User from "../models/User.js";
import Resident from "../models/Resident.js";
import { CustomRequest } from "../interfaces/customRequest.js";

class AuthController {
    createSendToken = async (
        user: any,
        statusCode: number,
        req: Request,
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

    login = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            const { email, password } = req.body;

            if (!email || !password) {
                return next(new AppError("Please provide email and password!", 400));
            }

            let account: any = await User.findOne({ email }).select("+password");
            let isResident = false;

            if (!account) {
                console.log(`[AUTH] Checking Resident for ${email}`);
                account = await Resident.findOne({ email }).select("+password");
                isResident = true;
            }

            if (!account) {
                console.log(`[AUTH] Account not found: ${email}`);
                return next(new AppError("Incorrect email or password", 422));
            }

            console.log(`[AUTH] Account found, isResident: ${isResident}`);
            const isMatch = await account.correctPassword(password, account.password as string);
            console.log(`[AUTH] Password match result: ${isMatch}`);

            if (!isMatch) {
                return next(new AppError("Incorrect email or password", 422));
            }

            const token = await this.signToken(account._id, account.email, account.role);
            account.set("password", undefined, { strict: false });

            res.status(200).json({
                status: "success",
                user: account,
                token,
                isResident,
                needsPasswordChange: account.needsPasswordChange || false
            });
        }
    );

    protect = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            let token;
            if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
                token = req.headers.authorization.split(" ")[1];
            }

            if (!token || token === "null") {
                return next(new AppError("User not logged in!", 401));
            }

            const decoded = (await this.verifyToken(token)) as any;

            let freshAccount: any = await User.findById(decoded.id);
            if (!freshAccount) {
                freshAccount = await Resident.findById(decoded.id);
            }

            if (!freshAccount) {
                return next(new AppError("The account belonging to this token no longer exists.", 401));
            }

            req.user = freshAccount;
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

    updateResidentPassword = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            const { currentPassword, newPassword } = req.body;

            let account: any = await User.findById(req.user?._id).select('+password');
            if (!account) {
                account = await Resident.findById(req.user?._id).select('+password');
            }

            if (!account) return next(new AppError('Account not found', 404));

            if (!(await account.correctPassword(currentPassword, account.password))) {
                return next(new AppError('Current password incorrect', 401));
            }

            account.password = newPassword;
            account.needsPasswordChange = false;
            await account.save();

            this.createSendToken(account, 200, req, res);
        }
    );

    getMe = catchAsync(
        async (req: CustomRequest, res: Response, next: NextFunction) => {
            res.status(200).json({
                status: "success",
                data: req.user,
            });
        }
    );

    logOut = (req: CustomRequest, res: Response, next: NextFunction) => {
        res.status(200).json({
            status: "success",
            message: "Logged out successfully",
        });
    }

    signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => next(new AppError('Use admin portal to create accounts', 403)));
    test = catchAsync(async (req: Request, res: Response) => res.status(200).json({ status: 'success' }));
    verifyEmail = catchAsync(async (req: Request, res: Response) => res.status(200).json({ status: 'success' }));
    forgotPassword = catchAsync(async (req: Request, res: Response) => res.status(200).json({ status: 'success' }));
    resetPassword = catchAsync(async (req: Request, res: Response) => res.status(200).json({ status: 'success' }));
}

const authController = new AuthController();
export default authController;