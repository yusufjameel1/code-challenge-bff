import { IProduct, IScannedProduct } from './../types/product.types';
import { DiscountType, IPricingRule } from "../models/pricing-rule.model";

class Checkout {
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

    public scan(sku: string): void {
        // find the item with the given sku
        const item = this.items.find(item => item.sku === sku);

        if (item) {
            // get all the scanned items with the same sku
            const scannedSkuItems = this.scannedItems.filter(i => i.sku === sku);

            if (scannedSkuItems.length > 0) {
                // get all the pricing rules applicable to this sku
                const pricingRules = this.pricingRules.filter(rule => (rule.skus ?? []).includes(sku) && rule.isActive);

                if (pricingRules.length === 0) {
                    // if no pricing rules, simply increment the quantity
                    scannedSkuItems[0].quantity += 1;
                    return;
                }

                // get the existing quantity of the scanned items
                const existingQuantity = scannedSkuItems.reduce((sum, item) => sum + item.quantity, 1);

                // get the pricing rule from the variables above with the highest priority and the condition minQuantity === existingQuantity
                const applicableRules = pricingRules.filter(rule => rule.conditions.minQuantity === existingQuantity);
                if (applicableRules.length === 0) {

                    // check if there are any scanned items with the same sku but no rules applied
                    const scannedSkuItemsWithoutRule = this.scannedItems.find(i => i.sku === sku && (!i.rulesApplied || i.rulesApplied.length === 0));

                    // if found, increment the quantity of that item
                    if (scannedSkuItemsWithoutRule) {
                        scannedSkuItemsWithoutRule.quantity += 1;
                        const applicableRulesForOtherGroup = pricingRules.filter(rule => rule.conditions.minQuantity === scannedSkuItemsWithoutRule.quantity);

                        if (applicableRulesForOtherGroup.length > 0) {
                            const highestPriorityRule2 = applicableRulesForOtherGroup.sort((a, b) => b.priority - a.priority)[0];
                            scannedSkuItemsWithoutRule.rulesApplied = [highestPriorityRule2];

                            const scanSkuItem2 = JSON.parse(JSON.stringify(item)) as IScannedProduct;
                            scanSkuItem2.quantity = scannedSkuItemsWithoutRule.quantity;
                            scanSkuItem2.rulesApplied = [highestPriorityRule2];
                            const { conditions } = highestPriorityRule2;

                            if (highestPriorityRule2.discountType === DiscountType.BUY_X_GET_Y) {
                                scanSkuItem2.totalPrice = conditions.payQuantity! * item.price;
                            } else if (highestPriorityRule2.discountType === DiscountType.BULK_DISCOUNT) {
                                scanSkuItem2.modifiedPrice = conditions.discountedPrice!;
                            } else if (highestPriorityRule2.discountType === DiscountType.PERCENTAGE_OFF) {
                                scanSkuItem2.totalPrice = (conditions.minQuantity * item.price) * (1 - conditions.percentageOff! / 100);
                            } else if (highestPriorityRule2.discountType === DiscountType.FIXED_PRICE) {
                                scanSkuItem2.modifiedPrice = conditions.discountedPrice!;
                            }

                            // remove the old item
                            this.scannedItems = this.scannedItems.filter(i => i.sku !== sku && i.rulesApplied && i.rulesApplied.length > 0);
                            // add the new item with the updated quantity and rules applied
                            this.scannedItems.push(scanSkuItem2);
                        } else {
                            scannedSkuItemsWithoutRule.rulesApplied = [];
                        }
                    } else {
                        // if not found, add a new item with quantity 1
                        this.scannedItems.push({ ...item, quantity: 1 });
                    }
                    return;
                } else {
                    // get the rule with the highest priority
                    const highestPriorityRule = applicableRules.sort((a, b) => b.priority - a.priority)[0];

                    // first merge all the scanned items with the same sku into one item using scannedSkuItems variable that has all the scanned items with same sku
                    const totalQuantity = scannedSkuItems.reduce((sum, item) => sum + item.quantity, 1);
                    const scanSkuItem = JSON.parse(JSON.stringify(item)) as IScannedProduct;
                    scanSkuItem.quantity = totalQuantity;
                    scanSkuItem.rulesApplied = [highestPriorityRule];
                    const { conditions } = highestPriorityRule;

                    if (highestPriorityRule.discountType === DiscountType.BUY_X_GET_Y) {
                        scanSkuItem.totalPrice = conditions.payQuantity! * item.price;
                    } else if (highestPriorityRule.discountType === DiscountType.BULK_DISCOUNT) {
                        scanSkuItem.modifiedPrice = conditions.discountedPrice!;
                    } else if (highestPriorityRule.discountType === DiscountType.PERCENTAGE_OFF) {
                        scanSkuItem.totalPrice = (conditions.minQuantity * item.price) * (1 - conditions.percentageOff! / 100);
                    } else if (highestPriorityRule.discountType === DiscountType.FIXED_PRICE) {
                        scanSkuItem.modifiedPrice = conditions.discountedPrice!;
                    }
                    // remove all the scanned items with the same sku from the scannedItems array
                    this.scannedItems = this.scannedItems.filter(i => i.sku !== sku);
                    // add the new scanned item with the updated quantity and rules applied
                    this.scannedItems.push(scanSkuItem);
                }
            } else {
                // if not found, add a new item with quantity 1
                this.scannedItems.push({ ...item, quantity: 1 });
            }





        } else {
            console.info(`Product with SKU ${sku} not found`);
        }
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