import { Request, Response } from 'express';
import Package from "../models/Packages";
import { notifyUser } from './notificationController';
import { CustomRequest } from '../interfaces/customRequest';
import { UserRole } from '../interfaces/userInterface';

export const getPackages = async (req: any, res: Response): Promise<void> => {
    try {
        let query = {};

        // If the user is a resident, they can only see their own packages
        if (req.user?.role === UserRole.Resident) {
            query = { userId: req.user._id };
        }

        const packages = await Package.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            status: "success",
            data: packages
        });
    } catch (error) {
        console.error('Error fetching packages:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

export const getPackage = async (req: any, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const pkg = await Package.findById(packageId);
        if (!pkg) {
            res.status(404).json({ status: "fail", message: 'Package not found' });
            return;
        }
        res.status(200).json({
            status: "success",
            data: pkg
        });
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

export const createPackage = async (req: any, res: Response): Promise<void> => {
    try {
        const newPackage = await Package.create(req.body);

        // Notify resident
        if (req.body.userId) {
            notifyUser(
                req.body.userId,
                'package',
                'Package Arrived',
                `A new package from ${req.body.carrier} has arrived. Type: ${req.body.packageType}`,
                newPackage._id
            );
        }

        res.status(201).json({
            status: "success",
            data: newPackage
        });
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

export const updatePackage = async (req: any, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const updatedPackage = await Package.findByIdAndUpdate(packageId, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedPackage) {
            res.status(404).json({ status: "fail", message: 'Package not found' });
            return;
        }
        res.status(200).json({
            status: "success",
            data: updatedPackage
        });
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

export const deletePackage = async (req: any, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const deletedPackage = await Package.findByIdAndDelete(packageId);
        if (!deletedPackage) {
            res.status(404).json({ status: "fail", message: 'Package not found' });
            return;
        }
        res.status(200).json({
            status: "success",
            message: 'Package deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

export const collectPackage = async (req: any, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const { pickedUpBy } = req.body;

        const updatedPackage = await Package.findByIdAndUpdate(
            packageId,
            {
                status: 'collected',
                pickedUpBy,
                collectedAt: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            res.status(404).json({ status: "fail", message: 'Package not found' });
            return;
        }

        res.status(200).json({
            status: "success",
            data: updatedPackage
        });
    } catch (error) {
        console.error('Error collecting package:', error);
        res.status(500).json({ status: "error", message: 'Internal server error' });
    }
};

