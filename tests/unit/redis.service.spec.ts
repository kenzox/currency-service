import { RedisService } from '@/database/redis.service';
import { createClient } from 'redis';

jest.mock('redis', () => ({
    createClient: jest.fn(() => ({
        connect: jest.fn(),
        on: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
    })),
}));

jest.mock('@/config', () => ({
    config: {
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
    },
}));

describe('RedisService', () => {
    let redisService: RedisService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockClient: any;

    beforeEach(() => {
        // Clear mocks
        // We need to re-instantiate or just rely on the existing one having its mocks cleared?
        // Since singleton is created at import, we are testing the singleton effectively or new instance?
        // The test creates 'new RedisService()'.
        // The mock factory provides the client for BOTH the singleton (unused here) and this new instance.
        jest.clearAllMocks();

        // We can get the mock client from the createClient call result
        // But since createClient is a mock function, we can inspect what it returned or just rely on the fact that any call returns the structure.
        redisService = new RedisService();
        // Capture the client instance if needed, but we can't easily access private 'client'.
        // But we know createClient was called.
    });

    it('should create client', () => {
        // createClient is called at least once (twice actually, once for singleton, once for test)
        expect(createClient).toHaveBeenCalled();
    });

    // Add more tests here for get/set and resilience
});
