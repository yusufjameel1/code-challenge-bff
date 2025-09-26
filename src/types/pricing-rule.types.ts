import { Document } from 'mongoose';

export interface IPricingRuleBase {
    sku: string;
    description: string;
}

export interface IPricingRuleDocument extends Document {
    sku: string;
    type: string;
    description: string;
    condition: {
        minQuantity?: number;
        buyQuantity?: number;
        getQuantity?: number;
        newPrice?: number;
        freeProductSku?: string;
        quantity?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}