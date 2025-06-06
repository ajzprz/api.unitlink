import express from 'express';
import residentController from '../controllers/residentController';
const residentRouter = express.Router()

residentRouter.route('/add').post(residentController.addResident)
residentRouter.route('/').get(residentController.getResidents)

export default residentRouter;