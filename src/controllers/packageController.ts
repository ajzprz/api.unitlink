import Packages from "../models/Packages";
import { Request, Response } from 'express';

export const getPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const packages = await Packages.findById(packageId);
        if (!packages) {
            res.status(404).json({ message: 'Package not found' });
            return;
        }
        res.json(packages);
    } catch (error) {
        console.error('Error fetching package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createPackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const newPackage = new Packages(req.body);
        const savedPackage = await newPackage.save();
        res.status(201).json(savedPackage);
    } catch (error) {
        console.error('Error creating package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const updatedPackage = await Packages.findByIdAndUpdate(packageId, req.body, { new: true });
        if (!updatedPackage) {
            res.status(404).json({ message: 'Package not found' });
            return;
        }
        res.json(updatedPackage);
    } catch (error) {
        console.error('Error updating package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const deletePackage = async (req: Request, res: Response): Promise<void> => {
    try {
        const packageId = req.params.id;
        const deletedPackage = await Packages.findByIdAndDelete(packageId);
        if (!deletedPackage) {
            res.status(404).json({ message: 'Package not found' });
            return;
        }
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Error deleting package:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
