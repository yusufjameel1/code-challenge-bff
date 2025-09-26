import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger.utils';

const logger = Logger.getInstance();

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    logger.info(`[${req.method}] ${req.path} - Request: ${JSON.stringify({
        body: req.body,
        params: req.params,
        query: req.query,
        userId: (req as any).user?.userId
    })}`);

    const originalSend = res.send;
    res.send = function(data) {
        const duration = Date.now() - start;
        logger.info(`[${req.method}] ${req.path} - Response: ${res.statusCode} (${duration}ms)`);
        return originalSend.call(this, data);
    };

    next();
};