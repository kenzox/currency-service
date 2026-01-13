import { z } from 'zod';

export const ConvertQuerySchema = z.object({
    from: z.string().length(3).uppercase(),
    to: z.string().length(3).uppercase(),
    amount: z.string().transform(Number).pipe(z.number().positive()),
});

export const RatesQuerySchema = z.object({
    base: z.string().length(3).uppercase().optional().default('USD'),
});

export type ConvertQueryDto = z.infer<typeof ConvertQuerySchema>;
export type RatesQueryDto = z.infer<typeof RatesQuerySchema>;
