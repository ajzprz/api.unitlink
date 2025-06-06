import { Request } from "express";
import { IUserDocument } from "./userInterface";

export interface CustomRequest extends Request {
    user?: IUserDocument
}