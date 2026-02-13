import express from 'express';
import * as notificationController from '../controllers/notificationController';
import authController from '../controllers/authController';

const router = express.Router();

router.use(authController.protect);

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

export default router;
