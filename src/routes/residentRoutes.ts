import express from 'express';
import residentController from '../controllers/residentController';
import authController from '../controllers/authController';
const residentRouter = express.Router()

residentRouter.post('/update-password', authController.protect, authController.updateResidentPassword);

residentRouter.route('/').get(residentController.getResidents)
residentRouter.route('/add').post(residentController.addResident)
residentRouter.route('/edit').put(residentController.editResident)
residentRouter.route('/:id')
    .get(residentController.getResident)
    .delete(residentController.deleteResident)



export default residentRouter;