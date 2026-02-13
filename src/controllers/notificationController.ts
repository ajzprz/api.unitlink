import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import User from '../models/User';

export const getMyNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user.id;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: notifications.length,
        data: notifications
    });
});

export const getUnreadCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user.id;
    const count = await Notification.countDocuments({ recipient: userId, isRead: false });

    res.status(200).json({
        status: 'success',
        data: count
    });
});

export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { notificationId } = req.params;
    // @ts-ignore
    const userId = req.user.id;

    const notification = await Notification.findOne({ _id: notificationId, recipient: userId });

    if (!notification) {
        return next(new AppError('Notification not found', 404));
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
        status: 'success',
        data: notification
    });
});

export const markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    const userId = req.user.id;
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read'
    });
});

// Helper function to send notification to staff/admins
export const notifyStaff = async (type: string, title: string, message: string, relatedId?: string) => {
    try {
        const staffUsers = await User.find({ role: { $in: ['admin', 'concierge', 'superintendent', 'cleaner'] } });
        const notifications = staffUsers.map(user => ({
            recipient: user._id,
            type,
            title,
            message,
            relatedId
        }));
        await Notification.insertMany(notifications);
    } catch (err) {
        console.error('Error sending staff notifications:', err);
    }
};

// Helper function to send notification to a specific user
export const notifyUser = async (userId: string, type: string, title: string, message: string, relatedId?: string) => {
    try {
        await Notification.create({
            recipient: userId,
            type,
            title,
            message,
            relatedId
        });
    } catch (err) {
        console.error('Error sending user notification:', err);
    }
};

export const notifyAllUsers = async (type: string, title: string, message: string, relatedId?: string) => {
    try {
        const users = await User.find({ active: { $ne: false } }); // Only active users
        const notifications = users.map(user => ({
            recipient: user._id,
            type,
            title,
            message,
            relatedId
        }));
        await Notification.insertMany(notifications);
    } catch (err) {
        console.error('Error sending global notification:', err);
    }
};
