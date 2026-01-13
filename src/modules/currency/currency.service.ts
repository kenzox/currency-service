import { Decimal } from 'decimal.js';
import { config } from '@/config';
import { redisService } from '@/database/redis.service';
import { externalApiProvider } from '@/modules/currency/providers/external-api.provider';
import { AppError } from '@/core/app-error';
import { ERROR_CODES, ERROR_MESSAGES } from '@/core/error-codes';

export class CurrencyService {
    private readonly CACHE_KEY = 'currency_rates';
    private readonly CACHE_TTL = config.CACHE_TTL;

    async calculateCrossRate(
        amount: number | string,
        from: string,
        to: string,
        decimalPlaces: number = config.DECIMAL_PRECISION
    ): Promise<string> {
        const rates = await this.getRates();

        const fromKey = from.toUpperCase();
        const toKey = to.toUpperCase();

        // Check if currencies exist in our rates
        // Note: If 'from' is the base currency (e.g. USD), it might not be in the keys if rates are relative to it, 
        // but usually base is 1. We assume rates dictionary contains all available currencies including base with value 1 or we handle it.
        // However, external API usually returns rates relative to base.
        // If our base is USD, and we have EUR: 0.9, GBP: 0.8
        // We treat missing base as supported if we know the base. 
        // For Safety: We will check existence. If invalid, throw.

        // Check if supported
        if (!rates[fromKey] || !rates[toKey]) {
            // It's possible the base currency itself is not in the map if the API doesn't return it.
            // But let's assume standard behavior or add explicit check if we knew the base.
            // For now, simple check.
            throw new AppError(
                ERROR_CODES.UNSUPPORTED_CURRENCY,
                ERROR_MESSAGES[ERROR_CODES.UNSUPPORTED_CURRENCY],
                400
            );
        }

        const amountDecimal = new Decimal(amount);
        const fromRate = rates[fromKey];
        const toRate = rates[toKey];

        // Cross rate formula: (Amount / FromRate) * ToRate
        // Example: 100 EUR -> GBP. Base USD.
        // 1 USD = 0.9 EUR
        // 1 USD = 0.8 GBP
        // 100 EUR = 100 / 0.9 USD = 111.11 USD
        // 111.11 USD = 111.11 * 0.8 GBP = 88.88 GBP

        const result = amountDecimal.div(fromRate).mul(toRate);

        return result.toFixed(decimalPlaces);
    }

    async getExchangeRates(base: string = 'USD'): Promise<Record<string, string>> {
        const rates = await this.getRates();
        // If base is different, we might need re-calculation or just sending what we have (USD base).
        // API is USD base by default if we configured it. 
        // User requirement says `GET /rates`. 
        // Simple implementation: Return USD based rates. 
        // If user converts `USD` -> `TRY`, they get 27.5. 
        // The rates dictionary is { USD: 1, EUR: 0.85, TRY: 27.5 ... } relative to base.

        // If user asks for base=EUR, we might need to convert all.
        // But for MVP/Phase 4, let's just return the raw rates map (usually USD based).
        // Or we can implement rebasing. 
        // I'll return the raw rates for now converted to string.
        const result: Record<string, string> = {};

        // Rebase logic (simple):
        const baseRate = rates[base];
        if (!baseRate) throw new Error('ERR_UNSUPPORTED_CURRENCY');

        for (const [key, val] of Object.entries(rates)) {
            // Rate = Val / BaseVal
            // ex: USD=1, EUR=0.85. 
            // Base=EUR. 
            // New USD = 1 / 0.85 = 1.17
            // New EUR = 0.85 / 0.85 = 1
            result[key] = val.div(baseRate).toFixed(config.DECIMAL_PRECISION);
        }
        return result;
    }

    private async getRates(): Promise<Record<string, Decimal>> {
        // 1. Check Redis
        const cached = await redisService.get(this.CACHE_KEY);
        if (cached) {
            console.info('[CurrencyService] Cache HIT');
            const parsed = JSON.parse(cached);
            const rates: Record<string, Decimal> = {};
            for (const [key, val] of Object.entries(parsed)) {
                rates[key] = new Decimal(val as string | number);
            }
            return rates;
        }

        console.info('[CurrencyService] Cache MISS - Fetching from API');
        // 2. Fallback to API
        const rates = await externalApiProvider.getWaitRates();

        // Ensure base currency (USD) is included for calculation logic stability if not present
        // CurrencyAPI 'latest' relative to base usually doesn't include base itself in 'data' often, or value is 1.
        // Let's ensure USD is 1 if it's the base.
        if (!rates['USD']) {
            rates['USD'] = new Decimal(1);
        }

        // 3. Cache result (store as string to preserve precision)
        const toCache: Record<string, string> = {};
        for (const [key, val] of Object.entries(rates)) {
            toCache[key] = val.toString();
        }
        await redisService.set(this.CACHE_KEY, JSON.stringify(toCache), this.CACHE_TTL);

        return rates;
    }
}

export const currencyService = new CurrencyService();
