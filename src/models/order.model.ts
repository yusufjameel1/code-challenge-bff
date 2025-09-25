import mongoose, { Schema, Document } from 'mongoose';
import { IOrder } from '../types/order.types';

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    originalPrice: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, required: true, min: 0 },
    rulesApplied: { type: [String], default: [] }
});

const AppliedRuleSchema = new Schema({
    ruleId: { type: Schema.Types.ObjectId, ref: 'PricingRule', required: true },
    ruleName: { type: String, required: true },
    discountType: { type: String, required: true },
    discountAmount: { type: Number, required: true, min: 0 },
    appliedToItems: [{ type: String, required: true }]
});

const OrderSchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String, required: true, trim: true },
    scannedItems: { type: [String], required: true, validate: { validator: (v: any[]) => v.length > 0, message: 'Order must have at least one scanned item' } },
    items: { type: [OrderItemSchema], required: true, validate: { validator: (v: any[]) => v.length > 0, message: 'Order must have at least one item' } },
    appliedRules: { type: [AppliedRuleSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    totalDiscount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    orderDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
}, { timestamps: true });

OrderSchema.index({ userId: 1, orderDate: -1 });
OrderSchema.index({ status: 1 });

export const Order = mongoose.model<IOrder & Document>('Order', OrderSchema);