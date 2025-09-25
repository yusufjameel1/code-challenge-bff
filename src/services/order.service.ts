import { IScannedProduct } from '@/types/product.types';
import { Order } from '../models/order.model';
import { IOrder } from '../types/order.types';

interface CreateOrderData {
    userId: string;
    customerName: string;
    items: string[];
}

export class OrderService {
    private static instance: OrderService;

    private constructor() { }

    public static getInstance(): OrderService {
        if (!OrderService.instance) {
            OrderService.instance = new OrderService();
        }
        return OrderService.instance;
    }

    async createOrder(items: string[], userId: string, customerName: string, scannedItems: IScannedProduct[], total: number): Promise<IOrder> {
        const currentDate = new Date();
        const order = new Order({
            userId,
            customerName,
            scannedItems,
            items,
            total,
            orderDate: currentDate,
        });

        return await order.save();
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