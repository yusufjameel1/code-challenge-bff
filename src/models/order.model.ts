import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types/order.types';
import { IScannedProduct } from '@/types/product.types';
import { PricingRuleSchema } from './pricing-rule.model';

const ScannedProductSchema = new Schema<IScannedProduct>({
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
    rulesApplied: {
        type: [PricingRuleSchema],
        required: false,
    },
    totalPrice: {
        type: Number,
        required: false,
        min: 0,
    },
    modifiedPrice: {
        type: Number,
        required: false,
        min: 0,
    },
});

const OrderSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true, trim: true },
    items: { type: [String], required: true, validate: { validator: (v: any[]) => v.length > 0, message: 'Order must have at least one item' } },
    scannedItems: { type: [ScannedProductSchema], required: true, validate: { validator: (v: any[]) => v.length > 0, message: 'Order must have at least one scanned item' } },
    total: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder & Document>('Order', OrderSchema);