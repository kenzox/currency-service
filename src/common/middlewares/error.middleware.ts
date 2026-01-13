import { Request, Response, NextFunction } from 'express';
import { AppError } from '@/core/app-error';
import { ERROR_CODES, ERROR_MESSAGES } from '@/core/error-codes';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.id;

    // Log the error (simple console for now)
    console.error(`[${correlationId}] Error:`, err);

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            errorCode: err.errorCode,
            message: err.message,
            correlationId,
        });
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            errorCode: ERROR_CODES.VALIDATION_ERROR,
            message: ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR],
            details: err.issues,
            correlationId,
        });
    }

    // Default Error
    return res.status(500).json({
        success: false,
        errorCode: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR],
        correlationId,
    });
};
