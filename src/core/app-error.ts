export class AppError extends Error {
    constructor(
        public errorCode: string,
        public message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'AppError';
    }
}
