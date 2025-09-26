import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format'
});

export const createOrderSchema = z.object({
    body: z.object({
        customerName: z.string().min(1, 'Customer name is required').trim(),
        items: z.array(z.string().min(1, 'SKU is required')).min(1, 'Order must have at least one item')
    })
});

export const getOrderByIdSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});

export const deleteOrderSchema = z.object({
    params: z.object({
        id: objectIdSchema
    })
});