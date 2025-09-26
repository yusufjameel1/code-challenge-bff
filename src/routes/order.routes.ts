import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middleware/validation.middleware';
import {
    createOrderSchema,
    getOrderByIdSchema,
    deleteOrderSchema
} from '../schemas/order.schema';

const router = Router();
const orderController = OrderController.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     ScannedProduct:
 *       type: object
 *       properties:
 *         sku:
 *           type: string
 *           description: Product SKU
 *         name:
 *           type: string
 *           description: Product name
 *         price:
 *           type: number
 *           description: Original product price
 *         quantity:
 *           type: number
 *           description: Quantity of the product
 *         rulesApplied:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PricingRule'
 *           description: Applied pricing rules
 *         totalPrice:
 *           type: number
 *           description: Total price after rules (optional)
 *         modifiedPrice:
 *           type: number
 *           description: Modified unit price after rules (optional)
 *     PricingRule:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         skus:
 *           type: array
 *           items:
 *             type: string
 *         discountType:
 *           type: string
 *           enum: [BUY_X_GET_Y, BULK_DISCOUNT, PERCENTAGE_OFF, FIXED_PRICE]
 *         conditions:
 *           type: object
 *           properties:
 *             minQuantity:
 *               type: number
 *             payQuantity:
 *               type: number
 *             discountedPrice:
 *               type: number
 *             percentageOff:
 *               type: number
 *         priority:
 *           type: number
 *         isActive:
 *           type: boolean
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         customerName:
 *           type: string
 *         items:
 *           type: array
 *           items:
 *             type: string
 *           description: Original list of scanned item SKUs
 *         scannedItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ScannedProduct'
 *           description: Processed items with pricing rules applied
 *         total:
 *           type: number
 *           description: Total order amount
 *         orderDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: "John Doe"
 *               items:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["ipd", "atv", "atv", "vga"]
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', validateRequest(createOrderSchema), (req, res) => orderController.createOrder(req, res));

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders for the authenticated user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/', (req, res) => orderController.getAllOrders(req, res));

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get an order by ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', validateRequest(getOrderByIdSchema), (req, res) => orderController.getOrder(req, res));

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 *       403:
 *         description: Access denied
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', validateRequest(deleteOrderSchema), (req, res) => orderController.deleteOrder(req, res));

export default router;