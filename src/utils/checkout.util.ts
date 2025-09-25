import { IProduct, IScannedProduct } from './../types/product.types';
import { DiscountType, IPricingRule } from "../models/pricing-rule.model";

export default class Checkout {
    private pricingRules: IPricingRule[];
    private items: IProduct[];
    private scannedItems: IScannedProduct[] = [];

    constructor(pricingRules: IPricingRule[]) {
        this.pricingRules = pricingRules;
        this.items = [];
    }

    public setItems(items: IProduct[]): void {
        this.items = items;
    }

    public getScannedItems(): IScannedProduct[] {
        return this.scannedItems;
    }

    public scan(sku: string): void {
        const item = this.items.find(item => item.sku === sku);
        if (!item) {
            console.info(`Product with SKU ${sku} not found`);
            return;
        }

        const scannedSkuItems = this.scannedItems.filter(i => i.sku === sku);
        if (scannedSkuItems.length === 0) {
            this.scannedItems.push({ ...item, quantity: 1 });
            return;
        }

        const pricingRules = this.pricingRules.filter(rule => ((rule.skus ?? []).includes(sku) || rule.skus === null) && rule.isActive);
        if (pricingRules.length === 0) {
            scannedSkuItems[0].quantity += 1;
            return;
        }

        const existingQuantity = scannedSkuItems.reduce((sum, item) => sum + item.quantity, 1);
        const applicableRules = pricingRules.filter(rule => rule.conditions.minQuantity === existingQuantity);

        if (applicableRules.length === 0) {
            const scannedSkuItemsWithoutRule = this.scannedItems.find(i => i.sku === sku && (!i.rulesApplied || i.rulesApplied.length === 0));

            if (scannedSkuItemsWithoutRule) {
                scannedSkuItemsWithoutRule.quantity += 1;
                const applicableRulesForOtherGroup = pricingRules.filter(rule => rule.conditions.minQuantity === scannedSkuItemsWithoutRule.quantity);

                if (applicableRulesForOtherGroup.length > 0) {
                    const highestPriorityRule = this.getHighestPriorityRule(applicableRulesForOtherGroup);
                    const scanSkuItem = this.createScannedItemWithRule(item, scannedSkuItemsWithoutRule.quantity, highestPriorityRule);
                    Object.assign(scannedSkuItemsWithoutRule, scanSkuItem);
                } else {
                    scannedSkuItemsWithoutRule.rulesApplied = [];
                }
            } else {
                this.scannedItems.push({ ...item, quantity: 1 });
            }
        } else {
            const highestPriorityRule = this.getHighestPriorityRule(applicableRules);
            const totalQuantity = scannedSkuItems.reduce((sum, item) => sum + item.quantity, 1);
            const scanSkuItem = this.createScannedItemWithRule(item, totalQuantity, highestPriorityRule);

            this.scannedItems = this.scannedItems.filter(i => i.sku !== sku);
            this.scannedItems.push(scanSkuItem);
        }
    }

    private getHighestPriorityRule(rules: IPricingRule[]): IPricingRule {
        return rules.sort((a, b) => b.priority - a.priority)[0];
    }

    private createScannedItemWithRule(item: IProduct, quantity: number, rule: IPricingRule): IScannedProduct {
        const scanSkuItem = JSON.parse(JSON.stringify(item)) as IScannedProduct;
        scanSkuItem.quantity = quantity;
        scanSkuItem.rulesApplied = [rule];
        const { conditions } = rule;

        if (rule.discountType === DiscountType.BUY_X_GET_Y) {
            scanSkuItem.totalPrice = conditions.payQuantity! * item.price;
        } else if (rule.discountType === DiscountType.BULK_DISCOUNT) {
            scanSkuItem.modifiedPrice = conditions.discountedPrice!;
        } else if (rule.discountType === DiscountType.PERCENTAGE_OFF) {
            scanSkuItem.totalPrice = (conditions.minQuantity * item.price) * (1 - conditions.percentageOff! / 100);
        } else if (rule.discountType === DiscountType.FIXED_PRICE) {
            scanSkuItem.modifiedPrice = conditions.discountedPrice!;
        }

        return scanSkuItem;
    }

    public total(): number {
        if (this.scannedItems.length > 0) {
            return this.scannedItems.reduce((total, item) => {
                let itemPrice = 0;

                if (item.totalPrice) {
                    itemPrice = item.totalPrice;
                } else if (item.modifiedPrice) {
                    itemPrice = item.modifiedPrice * item.quantity;
                } else {
                    itemPrice = item.price * item.quantity;
                }

                return total + itemPrice;
            }, 0);
        }
        return 0;
    }
}