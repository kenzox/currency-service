import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

export const correlationIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] as string || randomUUID();
    req.id = correlationId;
    res.setHeader('X-Correlation-Id', correlationId);
    next();
};
