import { NextFunction, Response } from "express"
import { CustomRequest } from "../interfaces/customRequest"
import catchAsync from "../utils/catchAsync"
import Unit from "../models/Units"
import AppError from "../utils/appError"

class UnitController {
    getUnits = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const unit = await Unit.find().sort({ unitNumber: 1 });;
        res.status(200).json({
            status: "success",
            data: unit,
        });
    }
    )

    getUnitNumbers = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const unitNumbers = await Unit.find({}, "unitNumber");
        res.status(200).json({
            status: "success",
            data: unitNumbers,
        });
    }
    )

    getUnit = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const unit = await Unit.findById(id);

        if (!unit) {
            return next(new AppError("Unit not found", 404));
        }

        res.status(200).json({
            status: "success",
            data: unit,
        });
    })

    createUnit = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { unitNumber } = req.body;
        const existingUnit = await Unit.findOne({ unitNumber });
        if (existingUnit) {
            return next(new AppError("Unit already exists!", 400));
        }
        const newUnit = await Unit.create(req.body);
        res.status(201).json({
            status: "create unit success",
            data: newUnit,
        });
    })

    deleteUnit = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const unit = await Unit.findByIdAndDelete(id);
        console.log(unit)
        res.status(200).json({
            status: "delete unit success",
            data: unit,
        });
    }
    )

}

const unitController = new UnitController();

export default unitController;