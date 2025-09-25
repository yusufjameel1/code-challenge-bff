import { z } from 'zod';

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
        id: z.string().min(1, 'Product ID is required'),
    }),
});

export const getProductByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Product ID is required'),
    }),
});

export const getProductBySkuSchema = z.object({
    params: z.object({
        sku: z.string().min(1, 'SKU is required'),
    }),
});

export const deleteProductSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Product ID is required'),
    }),
});

export const searchProductsSchema = z.object({
    query: z.object({
        q: z.string().min(1, 'Search term is required'),
    }),
});