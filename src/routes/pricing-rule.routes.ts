import express from 'express';
import { PricingRuleController } from '../controllers/pricing-rule.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const controller = PricingRuleController.getInstance();

/**
 * @swagger
 * components:
 *   schemas:
 *     PricingRule:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - discountType
 *         - conditions
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: Name of the pricing rule
 *         description:
 *           type: string
 *           description: Detailed description of the rule
 *         skus:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of product SKUs this rule applies to. Null means applies to all products.
 *           nullable: true
 *         discountType:
 *           type: string
 *           enum: [BUY_X_GET_Y_FREE, BULK_DISCOUNT, PERCENTAGE_OFF, FIXED_PRICE]
 *           description: Type of discount to apply
 *         conditions:
 *           type: object
 *           required:
 *             - minQuantity
 *           properties:
 *             minQuantity:
 *               type: number
 *               description: Minimum quantity required to activate the rule
 *             payQuantity:
 *               type: number
 *               description: For BUY_X_GET_Y_FREE, quantity to pay for
 *             discountedPrice:
 *               type: number
 *               description: For FIXED_PRICE, the discounted price per unit
 *             percentageOff:
 *               type: number
 *               description: For PERCENTAGE_OFF, percentage discount to apply
 *             maxQuantity:
 *               type: number
 *               description: Maximum quantity the discount applies to
 *             maxDiscountAmount:
 *               type: number
 *               description: Maximum discount amount in currency units
 *         priority:
 *           type: number
 *           description: Priority of the rule (higher number = higher priority)
 *         stackable:
 *           type: boolean
 *           description: Whether this rule can be combined with other rules
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: When the rule becomes active
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: When the rule expires
 *         isActive:
 *           type: boolean
 *           description: Whether the rule is currently active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */



// Apply authentication middleware to all pricing rule routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/pricing-rules/search:
 *   get:
 *     summary: Search pricing rules by text
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query text
 *     responses:
 *       200:
 *         description: List of matching pricing rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingRule'
 *       400:
 *         description: Missing search query
 *       500:
 *         description: Server error
 */
router.get('/search', controller.searchRules.bind(controller));

/**
 * @swagger
 * /api/pricing-rules:
 *   get:
 *     summary: Get all pricing rules
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: skus
 *         schema:
 *           type: string
 *         description: Comma-separated list of SKUs
 *       - in: query
 *         name: currentDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter rules active at this date
 *     responses:
 *       200:
 *         description: List of pricing rules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PricingRule'
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new pricing rule
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PricingRule'
 *     responses:
 *       201:
 *         description: Created pricing rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.get('/', controller.getAllRules.bind(controller));
router.post('/', controller.createRule.bind(controller));

/**
 * @swagger
 * /api/pricing-rules/{id}:
 *   get:
 *     summary: Get a pricing rule by ID
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Pricing rule ID
 *     responses:
 *       200:
 *         description: A pricing rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update a pricing rule
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Pricing rule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PricingRule'
 *     responses:
 *       200:
 *         description: Updated pricing rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete a pricing rule
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Pricing rule ID
 *     responses:
 *       204:
 *         description: Rule deleted successfully
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Server error
 */
router.get('/:id', controller.getRule.bind(controller));
router.put('/:id', controller.updateRule.bind(controller));
router.delete('/:id', controller.deleteRule.bind(controller));

/**
 * @swagger
 * /api/pricing-rules/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a pricing rule
 *     tags: [Pricing Rules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Pricing rule ID
 *     responses:
 *       200:
 *         description: Deactivated pricing rule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PricingRule'
 *       404:
 *         description: Rule not found
 *       500:
 *         description: Server error
 */
router.patch('/:id/deactivate', controller.deactivateRule.bind(controller));

export default router;