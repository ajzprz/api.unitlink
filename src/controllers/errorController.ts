import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError.js";

const handleJsonWebTokenError = (err: AppError) => {
  const message = "Invalid token, please log in again!";
  return new AppError(message, 401);
};

const handleTokenExpiredError = (err: AppError) => {
  const message = "Your token has expired, please log in again!";
  return new AppError(message, 401);
};

const handleValidationError = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleCastError = (err: AppError) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err: any) => {
  const message = `Duplicate field value ${Object.keys(
    err.keyValue
  )}, please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    statusCode: err.statusCode,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
    });
  } else {
    //Log the error
    console.log("Error :: ", err);

    //Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const globalErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  let error = { ...err };

  if (err.name === "CastError") error = handleCastError(error);
  if (err.code === 11000) error = handleDuplicateFields(error);
  if (err.name === "ValidationError") error = handleValidationError(error);
  if (err.name === "JsonWebTokenError") error = handleJsonWebTokenError(error);
  if (err.name === "TokenExpiredError") error = handleTokenExpiredError(error);

  // if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
  // } else if (process.env.NODE_ENV === "production") {
//     sendErrorProd(error, res);
//   }
};

export default globalErrorHandler;