
class PricingCalculator {
    private pricingRules: PricingRule[];

    constructor(pricingRules: PricingRule[]) {
        this.pricingRules = pricingRules;
    }
}

interface PricingRule {
    itemCode: string;
    unitPrice: number;
    specialPrice?: {
        quantity: number;
        price: number;
    };
}