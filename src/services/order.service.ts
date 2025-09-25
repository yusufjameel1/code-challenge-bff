import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { PricingRule, DiscountType } from '../models/pricing-rule.model';
import { IOrder, IOrderItem, IAppliedRule } from '../types/order.types';

interface CreateOrderData {
    userId: string;
    customerName: string;
    items: string[];
}

export class OrderService {
    private static instance: OrderService;

    private constructor() {}

    public static getInstance(): OrderService {
        if (!OrderService.instance) {
            OrderService.instance = new OrderService();
        }
        return OrderService.instance;
    }

    async createOrder(orderData: CreateOrderData): Promise<IOrder> {
        const { userId, customerName, items } = orderData;
        
        // Get active pricing rules
        const currentDate = new Date();
        const activeRules = await PricingRule.find({
            isActive: true,
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate }
        }).sort({ priority: -1 });

        // Process each scanned item individually
        const orderItems: IOrderItem[] = [];
        const skuCounts: Record<string, number> = {};
        const appliedRules: IAppliedRule[] = [];
        
        for (const sku of items) {
            const product = await Product.findOne({ sku });
            if (!product) {
                throw new Error(`Product with SKU ${sku} not found`);
            }
            
            // Track SKU count for rule application
            skuCounts[sku] = (skuCounts[sku] || 0) + 1;
            
            // Apply pricing rules for this specific item
            const { finalPrice, rulesApplied } = this.applyRulesForItem(product, skuCounts[sku], activeRules, appliedRules);
            
            orderItems.push({
                productId: product._id.toString(),
                sku: product.sku,
                name: product.name,
                originalPrice: product.price,
                finalPrice,
                rulesApplied
            });
        }

        const subtotal = orderItems.reduce((sum, item) => sum + item.originalPrice, 0);
        const total = orderItems.reduce((sum, item) => sum + item.finalPrice, 0);
        const totalDiscount = subtotal - total;

        const order = new Order({
            userId,
            customerName,
            scannedItems: items,
            items: orderItems,
            appliedRules,
            subtotal,
            totalDiscount,
            total,
            orderDate: currentDate,
            status: 'pending'
        });

        return await order.save();
    }

    private applyRulesForItem(product: any, currentCount: number, rules: any[], appliedRules: IAppliedRule[]): { finalPrice: number; rulesApplied: string[] } {
        let finalPrice = product.price;
        const rulesApplied: string[] = [];

        for (const rule of rules) {
            if (!rule.skus?.includes(product.sku)) continue;
            
            let ruleApplied = false;
            let discountAmount = 0;

            switch (rule.discountType) {
                case DiscountType.BUY_X_GET_Y:
                    if (currentCount >= rule.conditions.minQuantity && currentCount % rule.conditions.minQuantity > rule.conditions.payQuantity) {
                        finalPrice = 0; // Free item
                        discountAmount = product.price;
                        ruleApplied = true;
                    }
                    break;

                case DiscountType.BULK_DISCOUNT:
                    if (currentCount >= rule.conditions.minQuantity) {
                        finalPrice = rule.conditions.discountedPrice;
                        discountAmount = product.price - rule.conditions.discountedPrice;
                        ruleApplied = true;
                    }
                    break;

                case DiscountType.PERCENTAGE_OFF:
                    if (currentCount >= rule.conditions.minQuantity) {
                        const discount = (product.price * rule.conditions.percentageOff) / 100;
                        finalPrice = product.price - discount;
                        discountAmount = discount;
                        ruleApplied = true;
                    }
                    break;

                case DiscountType.FIXED_PRICE:
                    if (currentCount >= rule.conditions.minQuantity) {
                        finalPrice = rule.conditions.discountedPrice;
                        discountAmount = product.price - rule.conditions.discountedPrice;
                        ruleApplied = true;
                    }
                    break;
            }

            if (ruleApplied) {
                rulesApplied.push(rule.name);
                
                // Update or add to applied rules summary
                const existingRule = appliedRules.find(ar => ar.ruleId === rule._id.toString());
                if (existingRule) {
                    existingRule.discountAmount += discountAmount;
                    existingRule.appliedToItems.push(product.sku);
                } else {
                    appliedRules.push({
                        ruleId: rule._id.toString(),
                        ruleName: rule.name,
                        discountType: rule.discountType,
                        discountAmount,
                        appliedToItems: [product.sku]
                    });
                }
                break; // Apply only first matching rule
            }
        }

        return { finalPrice: Math.max(0, finalPrice), rulesApplied };
    }

    async getAllOrders(userId?: string): Promise<IOrder[]> {
        const filter = userId ? { userId } : {};
        return await Order.find(filter).populate('items.productId').sort({ orderDate: -1 });
    }

    async getOrderById(id: string): Promise<IOrder | null> {
        return await Order.findById(id).populate('items.productId');
    }

    async updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<IOrder | null> {
        return await Order.findByIdAndUpdate(id, { status }, { new: true });
    }

    async deleteOrder(id: string): Promise<IOrder | null> {
        return await Order.findByIdAndDelete(id);
    }
}