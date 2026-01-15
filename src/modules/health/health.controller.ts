import { Request, Response, NextFunction } from 'express';
import { redisService } from '@/database/redis.service';
import packageJson from '../../../package.json';

export class HealthController {
    async check(req: Request, res: Response, next: NextFunction) {
        try {
            const redisStatus = redisService.isReady ? 'connected' : 'disconnected';
            const status = 'ok';

            res.json({
                status,
                version: packageJson.version,
                timestamp: new Date().toISOString(),
                services: {
                    redis: redisStatus
                },
                correlationId: req.id
            });
        } catch (error) {
            next(error);
        }
    }
}

export const healthController = new HealthController();
