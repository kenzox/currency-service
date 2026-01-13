import { createClient, RedisClientType } from 'redis';
import { config } from '@/config';

export class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;

    constructor() {
        this.client = createClient({
            socket: {
                host: config.REDIS_HOST,
                port: config.REDIS_PORT,
            },
        });

        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.info('Redis Client Connected');
            this.isConnected = true;
        });

        // Don't await connection in constructor to avoid blocking startup if redis is optional/resilient
        this.connect();
    }

    public get isReady(): boolean {
        return this.isConnected;
    }

    private async connect() {
        try {
            await this.client.connect();
        } catch (error) {
            // Allow failure, just log it. Resilience.
            console.error('Failed to connect to Redis at startup:', error);
        }
    }

    async get(key: string): Promise<string | null> {
        if (!this.isConnected) return null;
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error(`Redis get error for key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        if (!this.isConnected) return;
        try {
            await this.client.set(key, value, { EX: ttlSeconds });
        } catch (error) {
            console.error(`Redis set error for key ${key}:`, error);
        }
    }
}

export const redisService = new RedisService();
