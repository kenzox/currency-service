import { z } from 'zod';

export const ConvertQuerySchema = z.object({
    from: z.string().length(3).uppercase(),
    to: z.string().length(3).uppercase(),
    amount: z.string().regex(/^\d+(\.\d+)?$/, 'Invalid amount format').transform(val => val), // Keep as string
});

export const RatesQuerySchema = z.object({
    base: z.string().length(3).uppercase().optional().default('USD'),
});

export type ConvertQueryDto = z.infer<typeof ConvertQuerySchema>;
export type RatesQueryDto = z.infer<typeof RatesQuerySchema>;
