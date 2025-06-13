import express from "express"
import unitController from "../controllers/unitController";
const unitRouter = express.Router();

unitRouter.route('/').get(unitController.getUnits);
unitRouter.route('/getUnitNumbers').get(unitController.getUnitNumbers);
unitRouter.route('/createUnit').post(unitController.createUnit)
unitRouter.route('/:id').delete(unitController.deleteUnit);

export default unitRouter;