import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const body = req.body || {};
        try {
            const result: any = await schema.safeParse({
                body,
                query: req.query,
                params: req.params,
            });

            if (!result.success) {
                const fieldPath = result.error.issues[0].path.join('.');
                if (fieldPath === 'body.refreshToken' && (!body.refreshToken || body.refreshToken === '')) {
                    return res.status(400).json({ error: 'Refresh token is required' });
                }
                return res.status(400).json({ error: result.error.issues[0].message });
            }

            req.body = result?.data?.body;
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};