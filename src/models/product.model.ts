import mongoose, { Schema } from 'mongoose';
import { IProduct, IProductDocument } from '../types/product.types';

const productSchema = new Schema<IProductDocument>(
    {
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
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
productSchema.index({ sku: 1 });
productSchema.index({ name: 'text' });

export const Product = mongoose.model<IProductDocument>('Product', productSchema);