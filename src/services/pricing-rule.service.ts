import { PricingRule, IPricingRule } from '../models/pricing-rule.model';

export class PricingRuleService {
    private static instance: PricingRuleService;

    private constructor() { }

    /**
     * Get the singleton instance of PricingRuleService
     */
    public static getInstance(): PricingRuleService {
        if (!PricingRuleService.instance) {
            PricingRuleService.instance = new PricingRuleService();
        }
        return PricingRuleService.instance;
    }

    /**
     * Create a new pricing rule
     */
    async createRule(ruleData: Partial<IPricingRule>): Promise<IPricingRule> {
        try {
            const rule = new PricingRule(ruleData);
            await rule.validate();
            return await rule.save();
        } catch (error) {
            console.error('[PricingRuleService] Error creating rule:', error);
            throw error;
        }
    }

    /**
     * Get all active pricing rules
     */
    async getAllRules(query: {
        isActive?: boolean;
        skus?: string[];
        currentDate?: Date;
    } = {}): Promise<IPricingRule[]> {
        try {
            const filter: any = {};

            if (query.isActive !== undefined) {
                filter.isActive = query.isActive;
            }

            if (query.currentDate) {
                filter.startDate = { $lte: query.currentDate };
                filter.endDate = { $gte: query.currentDate };
            }

            if (query.skus?.length) {
                filter.$or = [
                    { skus: null },  // Rules that apply to all SKUs
                    { skus: { $in: query.skus } }  // Rules that apply to specific SKUs
                ];
            }

            return await PricingRule
                .find(filter)
                .sort({ priority: -1, createdAt: -1 }).lean();
        } catch (error) {
            console.error('[PricingRuleService] Error getting rules:', error);
            throw error;
        }
    }

    /**
     * Get a single pricing rule by ID
     */
    async getRuleById(ruleId: string): Promise<IPricingRule | null> {
        try {
            return await PricingRule.findById(ruleId);
        } catch (error) {
            console.error('[PricingRuleService] Error getting rule:', error);
            throw error;
        }
    }

    /**
     * Update an existing pricing rule
     */
    async updateRule(ruleId: string, updates: Partial<IPricingRule>): Promise<IPricingRule | null> {
        try {
            const rule = await PricingRule.findById(ruleId);
            if (!rule) {
                return null;
            }

            // Remove immutable fields
            delete (updates as any)._id;
            delete (updates as any).createdAt;

            Object.assign(rule, updates);
            await rule.validate();
            return await rule.save();
        } catch (error) {
            console.error('[PricingRuleService] Error updating rule:', error);
            throw error;
        }
    }

    /**
     * Delete a pricing rule
     */
    async deleteRule(ruleId: string): Promise<boolean> {
        try {
            const result = await PricingRule.findByIdAndDelete(ruleId);
            return !!result;
        } catch (error) {
            console.error('[PricingRuleService] Error deleting rule:', error);
            throw error;
        }
    }

    /**
     * Deactivate a pricing rule
     */
    async deactivateRule(ruleId: string): Promise<IPricingRule | null> {
        try {
            return await PricingRule.findByIdAndUpdate(
                ruleId,
                { isActive: false },
                { new: true }
            );
        } catch (error) {
            console.error('[PricingRuleService] Error deactivating rule:', error);
            throw error;
        }
    }

    /**
     * Search pricing rules by text
     */
    async searchRules(searchText: string): Promise<IPricingRule[]> {
        try {
            return await PricingRule
                .find(
                    { $text: { $search: searchText } },
                    { score: { $meta: 'textScore' } }
                )
                .sort({ score: { $meta: 'textScore' } });
        } catch (error) {
            console.error('[PricingRuleService] Error searching rules:', error);
            throw error;
        }
    }
}