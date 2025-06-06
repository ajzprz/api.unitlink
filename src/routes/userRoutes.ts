import express from 'express';
import authController from '../controllers/authController';

const userRouter = express.Router();
userRouter.route('/').get(authController.test);
userRouter.route('/signup').post(authController.signup);
userRouter.route('/login').post(authController.login)
userRouter.route('/logout').post(authController.logOut);


export default userRouter; 