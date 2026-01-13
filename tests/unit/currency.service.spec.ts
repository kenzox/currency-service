import { CurrencyService } from '@/modules/currency/currency.service';
import { redisService } from '@/database/redis.service';
import { externalApiProvider } from '@/modules/currency/providers/external-api.provider';
import { Decimal } from 'decimal.js';

// Mocks
jest.mock('@/database/redis.service');
jest.mock('@/modules/currency/providers/external-api.provider');
jest.mock('@/config', () => ({
    config: {
        DECIMAL_PRECISION: 4,
    },
}));

describe('CurrencyService', () => {
    let currencyService: CurrencyService;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        currencyService = new CurrencyService(); // Uses the singleton instance effectively if imported, but here we instantiate class if exported or just use the exported singleton.
        // Actually the file exports `currencyService` const. We should test that or the class.
        // The code provided exports the class too. We'll use a fresh instance if possible or mock on dependencies of the singleton.
        // Since we mock dependencies, singleton is fine.
    });

    const mockRates = {
        USD: new Decimal(1),
        EUR: new Decimal(0.85), // 1 USD = 0.85 EUR
        TRY: new Decimal(27.5), // 1 USD = 27.5 TRY
    };

    it('should calculate cross rate correctly (USD -> TRY)', async () => {
        (redisService.get as jest.Mock).mockResolvedValue(null);
        (externalApiProvider.getWaitRates as jest.Mock).mockResolvedValue(mockRates);

        // 100 USD -> TRY
        // Model: 100 / 1 * 27.5 = 2750
        const result = await currencyService.calculateCrossRate(100, 'USD', 'TRY');
        expect(result).toBe('2750.0000');
    });

    it('should calculate cross rate correctly (EUR -> TRY)', async () => {
        (redisService.get as jest.Mock).mockResolvedValue(JSON.stringify({
            USD: '1',
            EUR: '0.85',
            TRY: '27.5'
        }));

        // 100 EUR -> TRY
        // 100 / 0.85 * 27.5 = 3235.2941...
        const result = await currencyService.calculateCrossRate(100, 'EUR', 'TRY');

        // Manual: 100 / 0.85 = 117.6470588
        // 117.647 * 27.5 = 3235.2941
        expect(result).toBe('3235.2941');
    });

    it('should calculate cross rate correctly (GBP -> USD)', async () => {
        (redisService.get as jest.Mock).mockResolvedValue(null);
        (externalApiProvider.getWaitRates as jest.Mock).mockResolvedValue({
            USD: new Decimal(1),
            GBP: new Decimal(0.80), // 1 USD = 0.8 GBP => 1 GBP = 1.25 USD
        });

        // 100 GBP -> USD
        // 100 / 0.8 * 1 = 125
        const result = await currencyService.calculateCrossRate(100, 'GBP', 'USD');
        expect(result).toBe('125.0000');
    });

    it('should throw ERR_UNSUPPORTED_CURRENCY for invalid currency', async () => {
        (redisService.get as jest.Mock).mockResolvedValue(null);
        (externalApiProvider.getWaitRates as jest.Mock).mockResolvedValue(mockRates);

        await expect(currencyService.calculateCrossRate(100, 'XYZ', 'USD'))
            .rejects.toThrow('ERR_UNSUPPORTED_CURRENCY');
    });
});
