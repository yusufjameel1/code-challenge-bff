import { Request, Response } from 'express';
import { PricingRuleService } from '../services/pricing-rule.service';
import { IPricingRule } from '../models/pricing-rule.model';

export class PricingRuleController {
    private static instance: PricingRuleController;
    private pricingRuleService: PricingRuleService;

    private constructor() {
        this.pricingRuleService = PricingRuleService.getInstance();
    }

    /**
     * Get the singleton instance of PricingRuleController
     */
    public static getInstance(): PricingRuleController {
        if (!PricingRuleController.instance) {
            PricingRuleController.instance = new PricingRuleController();
        }
        return PricingRuleController.instance;
    }

    /**
     * Create a new pricing rule
     */
    async createRule(req: Request, res: Response) {
        try {
            const rule = await this.pricingRuleService.createRule(req.body);
            res.status(201).json(rule);
        } catch (error: any) {
            console.error('[PricingRuleController] Error creating rule:', error);
            res.status(400).json({
                error: 'Failed to create pricing rule',
                details: error.message
            });
        }
    }

    /**
     * Get all pricing rules
     */
    public async getAllRules(req: Request, res: Response) {
        try {
            const query: any = {};

            // Parse query parameters
            if (req.query.active !== undefined) {
                query.isActive = req.query.active === 'true';
            }
            if (req.query.skus) {
                query.skus = (req.query.skus as string).split(',');
            }
            if (req.query.currentDate) {
                query.currentDate = new Date(req.query.currentDate as string);
            }

            const rules = await this.pricingRuleService.getAllRules(query);
            res.json(rules);
        } catch (error: any) {
            console.error('[PricingRuleController] Error getting rules:', error);
            res.status(500).json({
                error: 'Failed to retrieve pricing rules',
                details: error.message
            });
        }
    }

    /**
     * Get a single pricing rule
     */
    public async getRule(req: Request, res: Response) {
        try {
            const rule = await this.pricingRuleService.getRuleById(req.params.id);
            if (!rule) {
                return res.status(404).json({ error: 'Pricing rule not found' });
            }
            res.json(rule);
        } catch (error: any) {
            console.error('[PricingRuleController] Error getting rule:', error);
            res.status(500).json({
                error: 'Failed to retrieve pricing rule',
                details: error.message
            });
        }
    }

    /**
     * Update a pricing rule
     */
    public async updateRule(req: Request, res: Response) {
        try {
            const rule = await this.pricingRuleService.updateRule(req.params.id, req.body);
            if (!rule) {
                return res.status(404).json({ error: 'Pricing rule not found' });
            }
            res.json(rule);
        } catch (error: any) {
            console.error('[PricingRuleController] Error updating rule:', error);
            res.status(400).json({
                error: 'Failed to update pricing rule',
                details: error.message
            });
        }
    }

    /**
     * Delete a pricing rule
     */
    public async deleteRule(req: Request, res: Response) {
        try {
            const success = await this.pricingRuleService.deleteRule(req.params.id);
            if (!success) {
                return res.status(404).json({ error: 'Pricing rule not found' });
            }
            res.status(204).send();
        } catch (error: any) {
            console.error('[PricingRuleController] Error deleting rule:', error);
            res.status(500).json({
                error: 'Failed to delete pricing rule',
                details: error.message
            });
        }
    }

    /**
     * Deactivate a pricing rule
     */
    public async deactivateRule(req: Request, res: Response) {
        try {
            const rule = await this.pricingRuleService.deactivateRule(req.params.id);
            if (!rule) {
                return res.status(404).json({ error: 'Pricing rule not found' });
            }
            res.json(rule);
        } catch (error: any) {
            console.error('[PricingRuleController] Error deactivating rule:', error);
            res.status(500).json({
                error: 'Failed to deactivate pricing rule',
                details: error.message
            });
        }
    }

    /**
     * Search pricing rules
     */
    public async searchRules(req: Request, res: Response) {
        try {
            const searchText = req.query.q as string;
            if (!searchText) {
                return res.status(400).json({ error: 'Search query is required' });
            }

            const rules = await this.pricingRuleService.searchRules(searchText);
            res.json(rules);
        } catch (error: any) {
            console.error('[PricingRuleController] Error searching rules:', error);
            res.status(500).json({
                error: 'Failed to search pricing rules',
                details: error.message
            });
        }
    }
}