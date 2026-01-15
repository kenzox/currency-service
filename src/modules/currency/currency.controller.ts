import { Request, Response, NextFunction } from 'express';
import { currencyService } from './currency.service';
import { ConvertQuerySchema, RatesQuerySchema } from './dtos';
import { externalApiProvider } from './providers/external-api.provider'; // Access provider directly for rates or add method to service? 
// Architecture: Controller -> Service -> Provider. 
// Service has getRates private. I should expose getRates in service or use it via service. 
// But requirement says GET /convert uses cross-rate. GET /rates just lists rates? 
// I will assume GET /rates lists rates from service (cached).
// I need to expose getRates in `currency.service.ts` as public first.
// Wait, I can't modify service easily here without tool. 
// I will check if I can add getRates public method to service or if I should modify it.
// The previous service implementation had `private async getRates()`. 
// I should probably start by modifying the service to make `getRates` public or add `getExchangeRates`.
// Refactoring service first.

export class CurrencyController {
    /**
     * @openapi
     * /convert:
     *   get:
     *     summary: Convert currency
     *     parameters:
     *       - in: query
     *         name: from
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: to
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: amount
     *         required: true
     *         schema:
     *           type: number
     *     responses:
     *       200:
     *         description: Success
     */
    async convert(req: Request, res: Response, next: NextFunction) {
        try {
            const query = ConvertQuerySchema.parse(req.query);
            const result = await currencyService.calculateCrossRate(query.amount, query.from, query.to);

            res.json({
                success: true,
                data: {
                    amount: query.amount,
                    from: query.from,
                    to: query.to,
                    result: result // returning as string for precision
                },
                correlationId: req.id
            });
        } catch (error) {
            next(error);
        }
    }

    /* 
     * Note: The user didn't explicitly ask for GET /rates logic in Phase 3, 
     * but Phase 4 asks for "GET /rates" endpoint.
     * I need a way to get rates. I will assume I need to update service.
     */
    /**
     * @openapi
     * /rates:
     *   get:
     *     summary: Get exchange rates
     *     parameters:
     *       - in: query
     *         name: base
     *         schema:
     *           type: string
     *           default: USD
     *         description: Base currency code
     *     responses:
     *       200:
     *         description: Success
     */
    async getRates(req: Request, res: Response, next: NextFunction) {
        try {
            // This method needs to be implemented in Service to be clean.
            // For now, I will use a direct call if I can, or I'll implement a workaround until I update service.
            // Correct approach: Update service to expose `getExchangeRates`. 
            // I will do that in a separate tool call.
            // For this file content, I will assume `currencyService.getExchangeRates` exists.
            const query = RatesQuerySchema.parse(req.query);
            const rates = await currencyService.getExchangeRates(query.base);
            res.json({
                success: true,
                data: rates,
                correlationId: req.id
            });
        } catch (error) {
            next(error);
        }
    }
}

export const currencyController = new CurrencyController();
