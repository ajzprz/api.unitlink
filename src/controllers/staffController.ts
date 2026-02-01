import { Response, NextFunction } from "express";
import { CustomRequest } from "../interfaces/customRequest";
import catchAsync from "../utils/catchAsync";
import User from "../models/User";
import AppError from "../utils/appError";
import { UserRole } from "../interfaces/userInterface";

class StaffController {
    getStaff = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const staffRoles = [UserRole.Concierge, UserRole.Superintendent, UserRole.Cleaner];
        const staff = await User.find({ role: { $in: staffRoles } }).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            data: staff,
        });
    });

    addStaff = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { name, email, role, password } = req.body;

        if (!Object.values(UserRole).includes(role)) {
            return next(new AppError("Invalid role identified", 400));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError("User with this email already exists!", 400));
        }

        const newStaff = await User.create({
            name,
            email,
            role,
            password,
            passwordConfirm: password, // Required by User model validation
            needsPasswordChange: true
        });

        newStaff.password = undefined as any;

        res.status(201).json({
            status: "success",
            data: newStaff,
        });
    });

    editStaff = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { name, email, role } = req.body;

        const staff = await User.findById(id);
        if (!staff) {
            return next(new AppError("Staff record not found", 404));
        }

        const updatedStaff = await User.findByIdAndUpdate(id, {
            name,
            email,
            role
        }, { new: true, runValidators: true });

        res.status(200).json({
            status: "success",
            data: updatedStaff,
        });
    });

    deleteStaff = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const staff = await User.findOneAndDelete({ _id: id });

        if (!staff) {
            return next(new AppError("Staff record not found", 404));
        }

        res.status(200).json({
            status: "success",
            message: "Staff account purged from manifest",
        });
    });
}

const staffController = new StaffController();
export default staffController;
