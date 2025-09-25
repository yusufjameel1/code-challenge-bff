export interface Product {
    sku: string;
    name: string;
    price: number;
}

export interface BulkDiscountRule {
    sku: string;
    type: 'bulk_discount';
    description: string;
    condition: {
        minQuantity: number;
        buyQuantity: number;
        getQuantity: number;
    };
}

export interface PriceDropRule {
    sku: string;
    type: 'price_drop';
    description: string;
    condition: {
        minQuantity: number;
        newPrice: number;
    };
}

export interface FreeProductRule {
    sku: string;
    type: 'free_product';
    description: string;
    condition: {
        freeProductSku: string;
        quantity: number;
    };
}

export type PricingRule = BulkDiscountRule | PriceDropRule | FreeProductRule;

export interface ProductData {
    products: Product[];
}

export interface PricingRuleData {
    rules: PricingRule[];
}