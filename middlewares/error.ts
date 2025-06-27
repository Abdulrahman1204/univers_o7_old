import { Request, Response, NextFunction } from "express";

// Extend Error interface to include optional status property
interface CustomError extends Error {
    status?: number;
}

// Not Found Middleware
const notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error: CustomError = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
};

// Error Handler Middleware
const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
    const statusCode = res.statusCode === 200 ? err.status || 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        status: statusCode,
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

export { notFound, errorHandler };
