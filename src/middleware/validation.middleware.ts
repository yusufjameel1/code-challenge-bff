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
                return res.status(400).json({ error: result.error.issues[0].message });
            }

            // Replace req.body with the validated data
            req.body = result?.data?.body;
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};