import { IPricingRule } from "@/models/pricing-rule.model";

export interface IProduct {
    _id?: string;
    sku: string;
    name: string;
    price: number;
}

export interface IProductDocument extends Omit<IProduct, '_id'> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IScannedProduct extends Omit<IProduct, '_id'> {
    quantity: number;
    rulesApplied?: IPricingRule[];
    totalPrice?: number;
    modifiedPrice?: number;
}