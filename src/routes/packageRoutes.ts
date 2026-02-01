import express from 'express';
import {
    createPackage,
    deletePackage,
    getPackage,
    getPackages,
    updatePackage,
    collectPackage,
} from '../controllers/packageController';


import authController from '../controllers/authController';

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(getPackages)
    .post(authController.restrictTo(['admin', 'concierge', 'superintendent']), createPackage);

router
    .route('/:id')
    .get(getPackage)
    .put(authController.restrictTo(['admin', 'concierge', 'superintendent']), updatePackage)
    .patch(authController.restrictTo(['admin', 'concierge', 'superintendent']), collectPackage)
    .delete(authController.restrictTo(['admin']), deletePackage);


export default router;
