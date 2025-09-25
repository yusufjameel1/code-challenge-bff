import { z } from 'zod';
import { DiscountType } from '../models/pricing-rule.model';

const conditionsSchema = z.object({
    minQuantity: z.number().min(1),
    payQuantity: z.number().min(1).optional(),
    discountedPrice: z.number().min(0).optional(),
    percentageOff: z.number().min(0).max(100).optional(),
    maxQuantity: z.number().min(1).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
});

export const createPricingRuleSchema = z.object({
    body: z.object({
        name: z.string().min(1).trim(),
        description: z.string().min(1).trim(),
        skus: z.array(z.string()).nullable().optional(),
        discountType: z.nativeEnum(DiscountType),
        conditions: conditionsSchema,
        priority: z.number().min(0).max(100).optional(),
        stackable: z.boolean().optional(),
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
        isActive: z.boolean().optional(),
    }).refine(data => new Date(data.endDate) > new Date(data.startDate), {
        message: "End date must be after start date",
        path: ["endDate"]
    }),
});

export const updatePricingRuleSchema = z.object({
    body: z.object({
        name: z.string().min(1).trim().optional(),
        description: z.string().min(1).trim().optional(),
        skus: z.array(z.string()).nullable().optional(),
        discountType: z.nativeEnum(DiscountType).optional(),
        conditions: conditionsSchema.optional(),
        priority: z.number().min(0).max(100).optional(),
        stackable: z.boolean().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        isActive: z.boolean().optional(),
    }).refine(data => {
        if (data.startDate && data.endDate) {
            return new Date(data.endDate) > new Date(data.startDate);
        }
        return true;
    }, {
        message: "End date must be after start date",
        path: ["endDate"]
    }),
});