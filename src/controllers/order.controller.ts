import { Response } from 'express';
import { OrderService } from '../services/order.service';
import { AuthRequest } from '../types/request.types';
import Logger from '../utils/logger.utils';
import Checkout from '../utils/checkout.util';
import { PricingRuleService } from '../services/pricing-rule.service';
import { IPricingRule } from '../models/pricing-rule.model';
import { ProductService } from '../services/product.service';

const logger = Logger.getInstance();

export class OrderController {
    private static instance: OrderController;
    private orderService: OrderService;
    private pricingRuleService: PricingRuleService;
    private productService: ProductService;

    private constructor() {
        this.orderService = OrderService.getInstance();
        this.pricingRuleService = PricingRuleService.getInstance();
        this.productService = ProductService.getInstance();
    }

    public static getInstance(): OrderController {
        if (!OrderController.instance) {
            OrderController.instance = new OrderController();
        }
        return OrderController.instance;
    }

    async createOrder(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { items, customerName } = req.body;
            const userId = req.user!.userId;

            // get all active and valid pricing rules from pricing service
            const pricingRules: IPricingRule[] = await this.pricingRuleService.getAllRules({ isActive: true, currentDate: new Date() });
            const allProducts = await this.productService.getAllProducts();
            const products = allProducts.filter(product => items.includes(product.sku));
            const checkout = new Checkout(pricingRules);
            checkout.setItems(products);
            items.forEach((item: string) => checkout.scan(item));
            const order = await this.orderService.createOrder(items, userId, customerName, checkout.getScannedItems(), checkout.total());

            logger.info(`[OrderController] Order created successfully: ${order._id}`);
            res.status(201).json(order);
        } catch (error: any) {
            logger.error('[OrderController] Error creating order:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async getAllOrders(req: AuthRequest, res: Response): Promise<void> {
        try {
            const userId = req.user!.userId;
            const orders = await this.orderService.getAllOrders(userId);

            res.status(200).json(orders);
        } catch (error: any) {
            logger.error('[OrderController] Error fetching orders:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getOrder(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const order = await this.orderService.getOrderById(id);

            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }

            // Check if user owns the order
            if (order.userId !== req.user!.userId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }

            res.status(200).json(order);
        } catch (error: any) {
            logger.error('[OrderController] Error fetching order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const order = await this.orderService.getOrderById(id);
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }

            if (order.userId !== req.user!.userId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }

            const updatedOrder = await this.orderService.updateOrderStatus(id, status);

            logger.info(`[OrderController] Order status updated: ${id} -> ${status}`);
            res.status(200).json(updatedOrder);
        } catch (error: any) {
            logger.error('[OrderController] Error updating order status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteOrder(req: AuthRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const order = await this.orderService.getOrderById(id);
            if (!order) {
                res.status(404).json({ error: 'Order not found' });
                return;
            }

            if (order.userId !== req.user!.userId) {
                res.status(403).json({ error: 'Access denied' });
                return;
            }

            await this.orderService.deleteOrder(id);

            logger.info(`[OrderController] Order deleted: ${id}`);
            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error: any) {
            logger.error('[OrderController] Error deleting order:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}