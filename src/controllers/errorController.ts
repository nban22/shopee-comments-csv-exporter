import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";


export const routesNotFound = (req: Request, res: Response, next: NextFunction) => {
    return next(new AppError(400, `Can't find ${req.originalUrl} on this server!`));
}


export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
    });
}