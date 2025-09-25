export interface IOrderItem {
    productId: string;
    sku: string;
    name: string;
    originalPrice: number;
    finalPrice: number;
    rulesApplied: string[];
}

export interface IAppliedRule {
    ruleId: string;
    ruleName: string;
    discountType: string;
    discountAmount: number;
    appliedToItems: string[];
}

export interface IOrder {
    _id?: string;
    userId: string;
    customerName: string;
    scannedItems: string[];
    items: IOrderItem[];
    appliedRules: IAppliedRule[];
    subtotal: number;
    totalDiscount: number;
    total: number;
    orderDate: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
}

export interface IOrderDocument extends Omit<IOrder, '_id'> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}