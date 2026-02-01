import express from "express";
import staffController from "../controllers/staffController";
import authController from "../controllers/authController";

const staffRouter = express.Router();

// All staff routes are protected and restricted to admin
staffRouter.use(authController.protect);
staffRouter.use(authController.restrictTo(["admin"]));

staffRouter.route("/")
    .get(staffController.getStaff)
    .post(staffController.addStaff);

staffRouter.route("/:id")
    .patch(staffController.editStaff)
    .delete(staffController.deleteStaff);

export default staffRouter;
