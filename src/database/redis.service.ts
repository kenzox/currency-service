import { createClient, RedisClientType } from 'redis';
import { config } from '@/config';

export class RedisService {
    private client: RedisClientType;
    private isConnected: boolean = false;
    private memoryCache = new Map<string, { value: string; expiry: number }>();

    constructor() {
        this.client = createClient({
            socket: {
                host: config.REDIS_HOST,
                port: config.REDIS_PORT,
                reconnectStrategy: (retries) => {
                    // Maximum reconnect delay of 3 seconds
                    return Math.min(retries * 50, 3000);
                }
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

        // Don't await connection in constructor to avoid blocking startup
        this.connect();
    }

    public get isReady(): boolean {
        return this.isConnected;
    }

    private async connect() {
        try {
            await this.client.connect();
        } catch (error) {
            console.error('Failed to connect to Redis at startup:', error);
        }
    }

    async get(key: string): Promise<string | null> {
        // 1. Try Redis if connected
        if (this.isConnected) {
            try {
                const val = await this.client.get(key);
                if (val) {
                    // Update memory cache for consistency (Active L1)
                    // We don't know TTL here easily without another call, so we skip update or use default?
                    // Better strategy: Only use memory as fallback.
                    return val;
                }
            } catch (error) {
                console.error(`Redis get error for key ${key}, switching to memory fallback:`, error);
                this.isConnected = false;
            }
        }

        // 2. Fallback to Memory
        const entry = this.memoryCache.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.memoryCache.delete(key);
            return null;
        }

        console.warn(`[RedisService] Serving ${key} from In-Memory Fallback`);
        return entry.value;
    }

    async set(key: string, value: string, ttlSeconds: number): Promise<void> {
        // 1. Always write to Memory (Backup)
        const expiry = Date.now() + (ttlSeconds * 1000);
        this.memoryCache.set(key, { value, expiry });

        // 2. Write to Redis if connected
        if (this.isConnected) {
            try {
                await this.client.set(key, value, { EX: ttlSeconds });
            } catch (error) {
                console.error(`Redis set error for key ${key}:`, error);
                this.isConnected = false;
            }
        }
    }
}

export const redisService = new RedisService();
