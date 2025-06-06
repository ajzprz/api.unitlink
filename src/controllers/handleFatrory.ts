import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
// @ts-ignore
import aqp from "api-query-params";
import { CustomRequest } from "../interfaces/customRequest.js";

class HandlerFactory {
    deleteOne = (Model: any) =>
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const doc = await Model.findOneAndDelete(req.params.id);

            if (!doc) {
                return next(new AppError("No document found with that ID", 404));
            }

            res.status(200).json({
                status: "success",
                data: null,
            });
        });

    updateOne = (Model: any) =>
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const doc = await Model.findOneAndUpdate(
                { _id: req.params.id },
                req.body,
                {
                    new: true,
                    runValidators: true,
                }
            );

            if (!doc) {
                return next(new AppError("No document found with that ID", 404));
            }

            res.status(200).json({
                status: "success",
                data: doc,
            });
        });

    createOne = (Model: any) =>
        catchAsync(
            async (req: CustomRequest, res: Response, next: NextFunction) => {
                // Automatically add the user ID to the document if user
                if (req.user) req.body["createdBy"] = req.user._id;

                const doc = await Model.create(req.body);

                res.status(201).json({
                    status: "success",
                    data: doc,
                });
            }
        );

    getOne = (Model: any, popOptions?: any) =>
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            let query = Model.findById(req.params.id);
            if (popOptions) query = query.populate(popOptions);

            const doc = await query;

            if (!doc) {
                return next(new AppError("No document found with that ID", 404));
            }

            res.status(200).json({
                status: "success",
                data: doc,
            });
        });

    getAll = (Model: any) =>
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            // Parse query parameters using api-query-params
            const { filter, skip, limit, sort, projection, population } = aqp(
                req.query
            );

            //Deleting if any page sort and limit and fields exist in filter
            const excludedFields = ["page", "sort", "limit", "fields"];
            excludedFields.forEach((el) => delete filter[el]);

            // Options for mongoose-paginate-v2
            const options = {
                page: (req.query.page as any) * 1 || 1,
                limit: (req.query.limit as any) * 1 || 20,
                sort: sort || "-createdAt",
                populate: population,
            };

            // Build aggregate query
            const aggregateQuery = Model.aggregate([
                { $match: filter },
                ...(projection ? [{ $project: projection }] : []),
            ]);

            // Use aggregatePaginate for pagination
            const results = await Model.aggregatePaginate(aggregateQuery, options);

            res.status(200).json({
                status: "success",
                data: results,
            });
        });

    getPopular = (Model: any) =>
        catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const doc = await Model.findOne().sort({ createdAt: -1 });

            if (!doc) {
                return next(new AppError("No document found", 404));
            }

            res.status(200).json({
                status: "success",
                data: doc,
            });
        });
}

const factory = new HandlerFactory();
export default factory;