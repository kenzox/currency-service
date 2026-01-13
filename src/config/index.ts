import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3000').transform(Number),
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.string().default('6379').transform(Number),
    CURRENCY_API_URL: z.string().url(),
    CURRENCY_API_KEY: z.string().min(1),
    DECIMAL_PRECISION: z.string().default('4').transform(Number),
    CACHE_TTL: z.string().default('300').transform(Number), // 5 minutes default
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'debug']).default('info'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}

export const config = _env.data;
