import { Product } from '../models/product.model';
import { PricingRule, DiscountType } from '../models/pricing-rule.model';
import productsData from '../data/products.json';
import pricingRulesData from '../data/pricing-rules.json';
import Logger from './logger.utils';

const logger = Logger.getInstance();

function transformPricingRule(rule: any) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    switch (rule.type) {
        case 'bulk_discount':
            return {
                name: rule.description,
                description: rule.description,
                skus: [rule.sku],
                discountType: DiscountType.BULK_DISCOUNT,
                conditions: {
                    minQuantity: rule.condition.minQuantity,
                    discountedPrice: rule.condition.newPrice,
                },
                priority: 1,
                stackable: false,
                startDate: now,
                endDate: futureDate,
                isActive: true
            };
        case 'free_product':
            return {
                name: rule.description,
                description: rule.description,
                skus: [rule.sku],
                discountType: DiscountType.BUY_X_GET_Y_FREE,
                conditions: {
                    minQuantity: rule.condition.quantity,
                    payQuantity: rule.condition.quantity,
                },
                priority: 2,
                stackable: false,
                startDate: now,
                endDate: futureDate,
                isActive: true
            };
        default:
            return null;
    }
}

export async function initializeData(): Promise<void> {
    try {
        // Check and initialize products
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            logger.info('[SetupUtils] No products found. Initializing products collection...');
            await Product.insertMany(productsData.products);
            logger.info('[SetupUtils] Products initialized successfully');
        } else {
            logger.info('[SetupUtils] Products collection already contains data');
        }

        // Check and initialize pricing rules
        const ruleCount = await PricingRule.countDocuments();
        if (ruleCount === 0) {
            logger.info('[SetupUtils] No pricing rules found. Initializing pricing rules collection...');

            // Transform rules to match the schema
            const transformedRules = pricingRulesData.rules
                .map(transformPricingRule)
                .filter((rule): rule is NonNullable<typeof rule> => rule !== null);

            await PricingRule.insertMany(transformedRules);
            logger.info('[SetupUtils] Pricing rules initialized successfully');
        } else {
            logger.info('[SetupUtils] Pricing rules collection already contains data');
        }
    } catch (error) {
        logger.error('[SetupUtils] Error initializing data:', error);
        throw new Error('Failed to initialize data');
    }
}

export default {
    initializeData
};