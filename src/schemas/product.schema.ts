import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid ObjectId format'
});

export const createProductSchema = z.object({
    body: z.object({
        sku: z.string().min(1, 'SKU is required'),
        name: z.string().min(1, 'Name is required'),
        price: z.number().min(0, 'Price must be a positive number'),
    }),
});

export const updateProductSchema = z.object({
    body: z.object({
        sku: z.string().min(1).optional(),
        name: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
    }),
    params: z.object({
        id: objectIdSchema,
    }),
});

export const getProductByIdSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});

export const getProductBySkuSchema = z.object({
    params: z.object({
        sku: z.string().min(1, 'SKU is required'),
    }),
});

export const deleteProductSchema = z.object({
    params: z.object({
        id: objectIdSchema,
    }),
});

export const searchProductsSchema = z.object({
    query: z.object({
        q: z.string().min(1, 'Search term is required'),
    }),
});