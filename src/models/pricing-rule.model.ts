import mongoose, { Schema, Document } from 'mongoose';

export enum DiscountType {
    BUY_X_GET_Y = 'BUY_X_GET_Y',
    BULK_DISCOUNT = 'BULK_DISCOUNT',
    PERCENTAGE_OFF = 'PERCENTAGE_OFF',
    FIXED_PRICE = 'FIXED_PRICE',
}

export interface IPricingRule extends Document {
    name: string;
    description: string;
    skus: string[] | null;  // null means rule applies to all SKUs
    discountType: DiscountType;
    conditions: {
        minQuantity: number;
        payQuantity?: number;    // For BUY_X_GET_Y
        discountedPrice?: number; // For BULK_DISCOUNT or FIXED_PRICE
        percentageOff?: number;   // For PERCENTAGE_OFF
        maxQuantity?: number;     // Optional maximum quantity limit
        maxDiscountAmount?: number; // Optional maximum discount amount
    };
    priority: number;  // Higher priority rules are applied first
    stackable: boolean;  // Whether this rule can be combined with other rules
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const PricingRuleSchema: Schema = new Schema<IPricingRule>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    skus: {
        type: [String],
        default: null,  // null means applies to all SKUs
        validate: {
            validator: function (v: string[] | null) {
                return v === null || (Array.isArray(v) && v.length > 0);
            },
            message: 'SKUs must be null (for all products) or a non-empty array of product SKUs'
        }
    },
    discountType: {
        type: String,
        enum: Object.values(DiscountType),
        required: true
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stackable: {
        type: Boolean,
        default: false
    },
    conditions: {
        minQuantity: {
            type: Number,
            required: true,
            min: 1
        },
        payQuantity: {
            type: Number,
            min: 1
        },
        discountedPrice: {
            type: Number,
            min: 0
        },
        percentageOff: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes to efficiently query active rules
PricingRuleSchema.index({
    isActive: 1,
    startDate: 1,
    endDate: 1,
    priority: -1
});

// Text index for searching rules
PricingRuleSchema.index({
    name: 'text',
    description: 'text'
});

// Validate end date is after start date
PricingRuleSchema.pre('save', function (this: IPricingRule, next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

export const PricingRule = mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);