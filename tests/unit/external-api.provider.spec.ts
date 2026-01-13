import { ExternalApiProvider } from '@/modules/currency/providers/external-api.provider';
import axios from 'axios';
import axiosRetry from 'axios-retry';

jest.mock('axios');
jest.mock('axios-retry');
jest.mock('@/config', () => ({
    config: {
        CURRENCY_API_URL: 'http://mock-api',
        CURRENCY_API_KEY: 'mock-key',
    },
}));

describe('ExternalApiProvider', () => {
    let provider: ExternalApiProvider;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockAxiosInstance: any;

    beforeEach(() => {
        mockAxiosInstance = {
            get: jest.fn(),
        };
        (axios.create as jest.Mock).mockReturnValue(mockAxiosInstance);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider = new (ExternalApiProvider as any);
    });

    it('should initialize axios with correct config', () => {
        expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
            baseURL: 'http://mock-api',
        }));
    });

    // Add tests for getWaitRates
});
