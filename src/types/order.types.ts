import { IScannedProduct } from "./product.types";

export interface IOrder {
    _id?: string;
    userId: string;
    customerName: string;
    scannedItems: IScannedProduct[];
    items: string[];
    total: number;
    orderDate: Date;
}

export interface IOrderDocument extends Omit<IOrder, '_id'> {
    _id: string;
    createdAt: Date;
    updatedAt: Date;
}