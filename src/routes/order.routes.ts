import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { OrderController } from '../controllers/order.controller';
import { validateRequest } from '../middleware/validation.middleware';
import {
    createOrderSchema,
    getOrderByIdSchema,
    updateOrderStatusSchema,
    deleteOrderSchema
} from '../schemas/order.schema';

const router = Router();
const orderController = OrderController.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     OrderItem:
 *       type: object
 *       properties:
 *         productId:
 *           type: string
 *         sku:
 *           type: string
 *         name:
 *           type: string
 *         originalPrice:
 *           type: number
 *         finalPrice:
 *           type: number
 *         rulesApplied:
 *           type: array
 *           items:
 *             type: string
 *     AppliedRule:
 *       type: object
 *       properties:
 *         ruleId:
 *           type: string
 *         ruleName:
 *           type: string
 *         discountType:
 *           type: string
 *         discountAmount:
 *           type: number
 *         appliedToItems:
 *           type: array
 *           items:
 *             type: string
 *     Order:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         userId:
 *           type: string
 *         customerName:
 *           type: string
 *         scannedItems:
 *           type: array
 *           items:
 *             type: string
 *           description: Original list of scanned items as received
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OrderItem'
 *         appliedRules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AppliedRule'
 *         subtotal:
 *           type: number
 *         totalDiscount:
 *           type: number
 *         total:
 *           type: number
 *         orderDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
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
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated
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
router.patch('/:id/status', validateRequest(updateOrderStatusSchema), (req, res) => orderController.updateOrderStatus(req, res));

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