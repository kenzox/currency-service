import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '@/config';
import { Decimal } from 'decimal.js';

export interface CurrencyApiResponse {
    data: {
        [code: string]: {
            code: string;
            value: number;
        };
    };
}

export class ExternalApiProvider {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.CURRENCY_API_URL,
            headers: {
                'apikey': config.CURRENCY_API_KEY,
            },
            timeout: 5000,
        });

        axiosRetry(this.client, { retries: 3, retryDelay: axiosRetry.exponentialDelay });
    }

    async getWaitRates(base: string = 'USD'): Promise<Record<string, Decimal>> {
        try {
            const response = await this.client.get<CurrencyApiResponse>('/latest', {
                params: { base_currency: base },
            });

            const rates: Record<string, Decimal> = {};
            Object.values(response.data.data).forEach((item) => {
                rates[item.code] = new Decimal(item.value);
            });

            return rates;
        } catch (error) {
            console.error('External API Request Failed:', error);
            throw new Error('ERR_EXTERNAL_API_FAILED');
        }
    }
}

export const externalApiProvider = new ExternalApiProvider();
