import { Response, NextFunction } from "express";
import { CustomRequest } from "../interfaces/customRequest";
import catchAsync from "../utils/catchAsync";
import Resident from "../models/Resident";
import AppError from "../utils/appError";

class ResidentController {
    getResidents = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const allResident = await Resident.find();
        res.status(200).json({
            status: "success",
            user: allResident,
        });
    })

    addResident = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { email, unitNumber, firstName, lastName, contactNumber } = req.body;

        // Check if resident already exists
        const existingResident = await Resident.findOne({ email });
        if (existingResident) {
            return next(new AppError("Resident already exists!", 400));
        }

        // Create new resident
        const newResident = await Resident.create({
            unitNumber,
            firstName,
            lastName,
            contactNumber,
            email,
        });

        // Respond with success
        res.status(201).json({
            status: "success",
            user: newResident,
        });
    });
}

const residentController = new ResidentController();
export default residentController;
