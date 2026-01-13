export const ERROR_CODES = {
    VALIDATION_ERROR: 'ERR_VALIDATION',
    INTERNAL_SERVER_ERROR: 'ERR_INTERNAL',
    UNSUPPORTED_CURRENCY: 'ERR_UNSUPPORTED_CURRENCY',
    EXTERNAL_API_FAILED: 'ERR_EXTERNAL_API_FAILED',
    RATE_LIMIT_EXCEEDED: 'ERR_RATE_LIMIT',
} as const;

export const ERROR_MESSAGES = {
    [ERROR_CODES.VALIDATION_ERROR]: 'Invalid request parameters.',
    [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'An unexpected error occurred.',
    [ERROR_CODES.UNSUPPORTED_CURRENCY]: 'The specified currency is not supported.',
    [ERROR_CODES.EXTERNAL_API_FAILED]: 'Failed to retrieve currency rates from external provider.',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many requests.',
};
