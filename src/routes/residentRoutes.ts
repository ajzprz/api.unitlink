import express from 'express';
import residentController from '../controllers/residentController';
const residentRouter = express.Router()

residentRouter.route('/').get(residentController.getResidents)
residentRouter.route('/add').post(residentController.addResident)
residentRouter.route('/edit').put(residentController.editResident)
residentRouter.route('/:id').delete(residentController.deleteResident)


export default residentRouter;