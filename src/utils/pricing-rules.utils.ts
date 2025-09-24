import { PricingRule, DiscountType } from '../models/pricing-rule.model';

/**
 * Initialize default pricing rules for the store opening
 */
export async function initializePricingRules() {
    try {
        // Set end date to 3 months from now for opening deals
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3);

        const defaultRules = [
            {
                name: "Apple TV 3 for 2 Deal",
                description: "Buy 3 Apple TVs, pay for 2 only",
                skus: ["atv"],
                discountType: DiscountType.BUY_X_GET_Y_FREE,
                conditions: {
                    minQuantity: 3,
                    payQuantity: 2,
                    maxQuantity: 9  // Limit to 3 sets of the deal
                },
                priority: 10,
                stackable: false,
                startDate,
                endDate,
                isActive: true
            },
            {
                name: "Super iPad Bulk Discount",
                description: "Buy more than 4 iPads, get each for $499.99",
                skus: ["ipd"],
                discountType: DiscountType.FIXED_PRICE,
                conditions: {
                    minQuantity: 5,
                    discountedPrice: 499.99
                },
                priority: 20,
                stackable: false,
                startDate,
                endDate,
                isActive: true
            },
            {
                name: "Holiday Season Bundle Discount",
                description: "10% off when buying any Apple TV and iPad together",
                skus: ["atv", "ipd"],
                discountType: DiscountType.PERCENTAGE_OFF,
                conditions: {
                    minQuantity: 1,  // Need at least one of each
                    percentageOff: 10,
                    maxDiscountAmount: 200  // Maximum $200 discount
                },
                priority: 5,  // Lower priority than individual product deals
                stackable: true,
                startDate,
                endDate,
                isActive: true
            },
            {
                name: "Store-wide Opening Special",
                description: "5% off all products",
                skus: null,  // Applies to all SKUs
                discountType: DiscountType.PERCENTAGE_OFF,
                conditions: {
                    minQuantity: 1,
                    percentageOff: 5
                },
                priority: 1,  // Lowest priority
                stackable: true,
                startDate,
                endDate,
                isActive: true
            }
        ];

        // Create rules if they don't exist
        for (const rule of defaultRules) {
            await PricingRule.findOneAndUpdate(
                { name: rule.name },
                rule,
                { upsert: true, new: true }
            );
        }

        console.log('Default pricing rules initialized successfully');
    } catch (error) {
        console.error('Error initializing pricing rules:', error);
        throw error;
    }
}