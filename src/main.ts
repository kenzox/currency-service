import express from 'express';
import { config } from '@/config';
import { correlationIdMiddleware } from '@/common/middlewares/correlation-id.middleware';
import { errorHandler } from '@/common/middlewares/error.middleware';
import { currencyController } from '@/modules/currency/currency.controller';
import swaggerUi from 'swagger-ui-express';
import jsdoc from 'swagger-jsdoc';

const app = express();

app.use(express.json());
app.use(correlationIdMiddleware);

// Swagger Setup
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Currency Service API',
            version: '1.0.0',
            description: 'API for currency conversion and exchange rates',
        },
        servers: [
            {
                url: `http://localhost:${config.PORT}`,
            },
        ],
    },
    apis: ['./src/modules/**/*.ts', './dist/src/modules/**/*.js'], // Scan for docs in modules
};

// Manually add paths if we don't decorate controllers (or simple scan)
// For simplicity/speed in this agentic flow, I will define validation and paths here or in a separate file if needed.
// But standard jsdoc works if we add comments.
// Let's rely on basic manual def injected via options for now or assume jsdoc comments will be added.
// I'll add a simple doc object to 'swaggerOptions' to ensure at least these endpoints show up if scanning fails.
// Actually, let's keep it simple and clean. Using swagger-jsdoc requires comments. I'll add minimal comments below or in controller if I have time. 
// OR I can just hardcode the spec for now in a separate file.
// Let's try jsdoc scan.

const swaggerDocs = jsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));


// Routes
const router = express.Router();

router.get('/rates', (req, res, next) => currencyController.getRates(req, res, next));
router.get('/convert', (req, res, next) => currencyController.convert(req, res, next));


app.use('/api/v1', router); // Assuming /api/v1 prefix as common practice, though user didn't specify, likely good.
// The user request just said "GET /rates". I'll mount on root or just / for now?
// "GET /convert endpoint'i". Usually implies root or standard prefix. 
// I will mount on root or simple path to match exact request "GET /convert".
app.use('/', router);
// Health Check
import { healthController } from '@/modules/health/health.controller';
app.get('/health', (req, res, next) => healthController.check(req, res, next));

app.use(errorHandler);

app.listen(config.PORT, () => {
    console.info(`Service starting on port ${config.PORT}...`);
    console.info(`Swagger available at http://localhost:${config.PORT}/api-docs`);
});

export default app; // Export for testing
