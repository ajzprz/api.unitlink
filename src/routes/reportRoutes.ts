import express from 'express';
import reportController from '../controllers/reportController';
import authController from '../controllers/authController';

const reportRouter = express.Router();

// Protect all routes
reportRouter.use(authController.protect);

// Restrict to staff and admin only
reportRouter.use(authController.restrictTo(['admin', 'concierge', 'superintendent', 'cleaner']));

reportRouter.route('/')
    .get(reportController.getReports)
    .post(reportController.createReport);

reportRouter.route('/:id')
    .get(reportController.getReport)
    .delete(reportController.deleteReport);

reportRouter.route('/:id/entry')
    .post(reportController.addEntry);

reportRouter.route('/:id/complete')
    .patch(reportController.completeReport);

export default reportRouter;
