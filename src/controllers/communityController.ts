import { Response, NextFunction } from "express";
import catchAsync from "../utils/catchAsync";
import { CustomRequest } from "../interfaces/customRequest";
import { Announcement } from "../models/Announcement";
import { Amenity, AmenityBooking } from "../models/Amenity";
import { Posting } from "../models/Posting";
import AppError from "../utils/appError";
import { notifyAllUsers, notifyStaff, notifyUser } from "./notificationController";

class CommunityController {
    // Announcements
    getAllAnnouncements = catchAsync(async (req: CustomRequest, res: Response) => {
        const announcements = await Announcement.find({ isPublished: true }).sort('-createdAt');
        res.status(200).json({ status: 'success', data: announcements });
    });

    createAnnouncement = catchAsync(async (req: CustomRequest, res: Response) => {
        const announcement = await Announcement.create(req.body);

        // Notify all users about the new announcement
        // Fire and forget - don't await strictly if performance is key, but here awaiting is safer
        await notifyAllUsers(
            'announcement',
            'New Announcement: ' + announcement.title,
            announcement.content.substring(0, 100) + (announcement.content.length > 100 ? '...' : ''),
            announcement._id
        );

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

        // Get amenity details for the notification
        const amenity = await Amenity.findById(req.body.amenityId);

        // Notify staff/admins
        await notifyStaff(
            'amenity_request',
            'New Amenity Booking Request',
            `Resident ${req.user?.name} (Unit ${(req.user as any).unitNumber}) requested ${amenity?.name} on ${new Date(req.body.startTime).toLocaleDateString()}`,
            booking._id
        );

        res.status(201).json({ status: 'success', data: booking });
    });

    getMyBookings = catchAsync(async (req: CustomRequest, res: Response) => {
        const bookings = await AmenityBooking.find({ residentId: req.user?._id }).populate('amenityId');
        res.status(200).json({ status: 'success', data: bookings });
    });

    getBookingsByAmenity = catchAsync(async (req: CustomRequest, res: Response) => {
        const { amenityId } = req.params;
        // Only fetch approved bookings to show availability
        const bookings = await AmenityBooking.find({
            amenityId,
            status: 'approved',
            startTime: { $gte: new Date() } // Only future bookings
        });
        res.status(200).json({ status: 'success', data: bookings });
    });

    getAllBookings = catchAsync(async (req: CustomRequest, res: Response) => {
        const bookings = await AmenityBooking.find()
            .populate('amenityId')
            .populate('residentId', 'firstName lastName name email')
            .sort('-createdAt');
        res.status(200).json({ status: 'success', data: bookings });
    });

    getPublicBookings = catchAsync(async (req: CustomRequest, res: Response) => {
        // Fetch only approved bookings for the calendar
        const bookings = await AmenityBooking.find({
            status: 'approved',
            startTime: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) } // Fetch from last month onwards
        })
            .select('amenityId startTime endTime unitNumber status')
            .populate('amenityId', 'name');

        res.status(200).json({ status: 'success', data: bookings });
    });

    cancelBooking = catchAsync(async (req: CustomRequest, res: Response) => {
        const { bookingId } = req.params;

        const booking = await AmenityBooking.findById(bookingId);

        if (!booking) {
            throw new AppError('No booking found with that ID', 404);
        }

        // Check ownership
        if (booking.residentId.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
            throw new AppError('You are not authorized to cancel this booking', 403);
        }

        if (booking.status === 'cancelled') {
            throw new AppError('Booking is already cancelled', 400);
        }

        // Optional: Check 24/48h cancellation policy here if needed

        booking.status = 'cancelled';
        await booking.save();

        // Notify staff about cancellation if needed
        // await notifyStaff(...) 

        res.status(200).json({ status: 'success', data: booking });
    });

    updateBookingStatus = catchAsync(async (req: CustomRequest, res: Response) => {
        const { bookingId } = req.params;
        const { status } = req.body;

        const booking = await AmenityBooking.findByIdAndUpdate(
            bookingId,
            { status },
            { new: true, runValidators: true }
        ).populate('amenityId');

        if (!booking) {
            throw new AppError('No booking found with that ID', 404);
        }

        // Notify the resident
        if (booking.residentId) {
            await notifyUser(
                booking.residentId.toString(),
                'amenity_status',
                `Amenity Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
                `Your booking for ${(booking.amenityId as any)?.name} has been ${status}.`,
                booking._id
            );
        }

        res.status(200).json({ status: 'success', data: booking });
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
