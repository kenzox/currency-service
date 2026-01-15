import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { config } from '@/config';
import { Decimal } from 'decimal.js';
import { AppError } from '@/core/app-error';
import { ERROR_CODES, ERROR_MESSAGES } from '@/core/error-codes';

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
        } catch (error: any) {
            console.error('External API Request Failed:', error.message);

            if (error.response) {
                // Rate Limit
                if (error.response.status === 429) {
                    // Check if AppError is imported? It is not imported in original file.
                    // I need to add import or throw generic object that middleware understands?
                    // Better to throw AppError. I need to check imports.
                    throw new AppError(
                        ERROR_CODES.RATE_LIMIT_EXCEEDED,
                        ERROR_MESSAGES[ERROR_CODES.RATE_LIMIT_EXCEEDED],
                        429
                    );
                }
            }

            // Network errors (timeout, dns) or 5xx
            if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || !error.response) {
                throw new AppError(
                    ERROR_CODES.EXTERNAL_API_UNAVAILABLE,
                    ERROR_MESSAGES[ERROR_CODES.EXTERNAL_API_UNAVAILABLE],
                    502
                );
            }

            throw new AppError(
                ERROR_CODES.EXTERNAL_API_FAILED,
                ERROR_MESSAGES[ERROR_CODES.EXTERNAL_API_FAILED],
                502
            );
        }
    }
}

export const externalApiProvider = new ExternalApiProvider();
