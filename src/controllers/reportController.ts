import { Response, NextFunction } from 'express';
import { CustomRequest } from '../interfaces/customRequest';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import OccurrenceReport from '../models/OccurrenceReport';

class ReportController {
    // Get all reports (with optional filtering)
    getReports = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        console.log(`[REPORT] Getting reports. User: ${req.user?.email}, Role: ${req.user?.role}`);
        const { reportType, status, staffId } = req.query;

        const filter: any = {};
        if (reportType) filter.reportType = reportType;
        if (status) filter.status = status;
        if (staffId) filter.staffId = staffId;

        // If not admin, only show own reports
        if (req.user?.role !== 'admin') {
            filter.staffId = req.user?._id;
        }

        const reports = await OccurrenceReport.find(filter).sort({ date: -1 });
        console.log(`[REPORT] Found ${reports.length} reports matching filter:`, filter);

        res.status(200).json({
            status: 'success',
            results: reports.length,
            data: reports,
        });
    });

    // Get single report
    getReport = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const report = await OccurrenceReport.findById(id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        // Check if user has access to this report
        if (req.user?.role !== 'admin' && report.staffId.toString() !== req.user?._id.toString()) {
            return next(new AppError('You do not have permission to access this report', 403));
        }

        res.status(200).json({
            status: 'success',
            data: report,
        });
    });

    // Create new report
    createReport = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        console.log(`[REPORT] Creating report:`, req.body);
        const { reportType, shiftStart, category } = req.body;

        try {
            const user = req.user as any;
            const staffName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Staff';

            const newReport = await OccurrenceReport.create({
                staffId: req.user?._id,
                staffName,
                reportType,
                category: category || 'general',
                date: new Date(),
                shiftStart: shiftStart || new Date(),
                status: 'in-progress',
                entries: [],
            });

            console.log(`[REPORT] Report created successfully: ${newReport._id}`);

            res.status(201).json({
                status: 'success',
                data: newReport,
            });
        } catch (error: any) {
            console.error(`[REPORT] Error creating report:`, error.message);
            return next(new AppError('Failed to create report document', 400));
        }
    });

    // Add entry to report
    addEntry = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { time, description } = req.body;

        const report = await OccurrenceReport.findById(id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        // Check if user owns this report
        if (report.staffId.toString() !== req.user?._id.toString()) {
            return next(new AppError('You can only add entries to your own reports', 403));
        }

        report.entries.push({
            time: time || new Date(),
            description,
        });

        await report.save();

        res.status(200).json({
            status: 'success',
            data: report,
        });
    });

    // Complete report (end shift)
    completeReport = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { shiftEnd } = req.body;

        const report = await OccurrenceReport.findById(id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        // Check if user owns this report
        if (report.staffId.toString() !== req.user?._id.toString()) {
            return next(new AppError('You can only complete your own reports', 403));
        }

        report.status = 'completed';
        report.shiftEnd = shiftEnd || new Date();

        await report.save();

        res.status(200).json({
            status: 'success',
            data: report,
        });
    });

    // Delete report
    deleteReport = catchAsync(async (req: CustomRequest, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const report = await OccurrenceReport.findById(id);

        if (!report) {
            return next(new AppError('Report not found', 404));
        }

        // Only admin or report owner can delete
        if (req.user?.role !== 'admin' && report.staffId.toString() !== req.user?._id.toString()) {
            return next(new AppError('You do not have permission to delete this report', 403));
        }

        await OccurrenceReport.findByIdAndDelete(id);

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });
}

export default new ReportController();
