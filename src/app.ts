import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config';
import { authenticateToken } from './middleware/auth.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import authRoutes from './routes/auth.routes';
import orderRoutes from './routes/order.routes';
import pricingRuleRoutes from './routes/pricing-rule.routes';
import productRoutes from './routes/product.routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Code Challenge BFF API Documentation'
}));

// Auth routes (unprotected)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/products', productRoutes);
app.use('/api/pricing-rules', pricingRuleRoutes);
app.use('/api/orders', orderRoutes);

// Protected routes (general)
app.use('/api', authenticateToken);

// Basic route (protected)
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
});

export default app;