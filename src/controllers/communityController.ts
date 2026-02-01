import { Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { CustomRequest } from "../interfaces/customRequest";
import { Announcement } from "../models/Announcement";
import { Amenity, AmenityBooking } from "../models/Amenity";
import { Posting } from "../models/Posting";
import AppError from "../utils/appError";

class CommunityController {
    // Announcements
    getAllAnnouncements = catchAsync(async (req: CustomRequest, res: Response) => {
        const announcements = await Announcement.find({ isPublished: true }).sort('-createdAt');
        res.status(200).json({ status: 'success', data: announcements });
    });

    createAnnouncement = catchAsync(async (req: CustomRequest, res: Response) => {
        const announcement = await Announcement.create(req.body);
        res.status(201).json({ status: 'success', data: announcement });
    });

    // Amenities
    getAllAmenities = catchAsync(async (req: CustomRequest, res: Response) => {
        const amenities = await Amenity.find({ isActive: true });
        res.status(200).json({ status: 'success', data: amenities });
    });

    bookAmenity = catchAsync(async (req: CustomRequest, res: Response) => {
        const booking = await AmenityBooking.create({
            ...req.body,
            residentId: req.user?._id,
            unitNumber: (req.user as any).unitNumber
        });
        res.status(201).json({ status: 'success', data: booking });
    });

    getMyBookings = catchAsync(async (req: CustomRequest, res: Response) => {
        const bookings = await AmenityBooking.find({ residentId: req.user?._id }).populate('amenityId');
        res.status(200).json({ status: 'success', data: bookings });
    });

    // Postings
    getAllPostings = catchAsync(async (req: CustomRequest, res: Response) => {
        const postings = await Posting.find({ status: 'active' }).populate('residentId', 'firstName lastName');
        res.status(200).json({ status: 'success', data: postings });
    });

    createPosting = catchAsync(async (req: CustomRequest, res: Response) => {
        const posting = await Posting.create({
            ...req.body,
            residentId: req.user?._id
        });
        res.status(201).json({ status: 'success', data: posting });
    });

    getMyPostings = catchAsync(async (req: CustomRequest, res: Response) => {
        const postings = await Posting.find({ residentId: req.user?._id });
        res.status(200).json({ status: 'success', data: postings });
    });
}

export default new CommunityController();
