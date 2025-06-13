import { Response, NextFunction } from "express";
import { CustomRequest } from "../interfaces/customRequest";
import catchAsync from "../utils/catchAsync";
import Resident from "../models/Resident";
import AppError from "../utils/appError";

class ResidentController {
    getResidents = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const allResident = await Resident.find().sort({ unitNumber: 1 });
        res.status(200).json({
            status: "success",
            user: allResident,
        });
    })

    addResident = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { email, unitNumber, firstName, lastName, contactNumber, parkingSpot } = req.body;

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
            parkingSpot
        });

        // Respond with success
        res.status(201).json({
            status: "create resident success",
            user: newResident,
        });
    });

    editResident = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { email, unitNumber, firstName, lastName, contactNumber, parkingSpot } = req.body;

        // Check if resident exists
        const existingResident = await Resident.findOne({ id });
        if (!existingResident) {
            return next(new AppError("Resident doesnot exists!", 400));
        }

        const editResident = await Resident.findByIdAndDelete((id), {
            unitNumber,
            firstName,
            lastName,
            contactNumber,
            email,
            parkingSpot
        });

        res.status(200).json({
            status: "edit resident success",
            user: editResident,
        });
    });

    deleteResident = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const resident = await Resident.findOneAndDelete({ _id: id });

        res.status(200).json({
            status: "delete resident success",
            user: resident,
        });
    })
}

const residentController = new ResidentController();
export default residentController;
