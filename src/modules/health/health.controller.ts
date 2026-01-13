import { Request, Response } from 'express';
import { redisService } from '@/database/redis.service';
import packageJson from '../../../package.json';

export class HealthController {
    async check(req: Request, res: Response) {
        const redisStatus = redisService.isReady ? 'connected' : 'disconnected';

        // If Redis is critical, we might return 503 if disconnected. 
        // But for now, app is resilient.
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
    }
}

export const healthController = new HealthController();
