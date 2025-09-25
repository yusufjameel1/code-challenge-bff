import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { PricingRule, DiscountType } from '../src/models/pricing-rule.model';
import { User } from '../src/models/user.model';
import { generateTokens } from '../src/utils/jwt.utils';

describe('Pricing Rule Routes', () => {
    let accessToken: string;
    let userId: string;

    const validPricingRule = {
        name: 'Test Rule',
        description: 'Test pricing rule',
        skus: ['ipd'],
        discountType: DiscountType.BULK_DISCOUNT,
        conditions: {
            minQuantity: 5,
            discountedPrice: 499.99
        },
        priority: 1,
        stackable: false,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
    };

    beforeAll(async () => {
        const user = await User.create({
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });
        userId = user._id.toString();
        const tokens = await generateTokens(user);
        accessToken = tokens.accessToken;
    });

    beforeEach(async () => {
        await PricingRule.deleteMany({});
    });

    afterAll(async () => {
        await User.deleteMany({});
        await PricingRule.deleteMany({});
    });

    describe('POST /api/pricing-rules', () => {
        it('should create a new pricing rule successfully', async () => {
            const response = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule)
                .expect(201);

            expect(response.body).toMatchObject({
                name: validPricingRule.name,
                description: validPricingRule.description,
                discountType: validPricingRule.discountType
            });
            expect(response.body._id).toBeDefined();
        });

        it('should not create a pricing rule without authentication', async () => {
            const response = await request(app)
                .post('/api/pricing-rules')
                .send(validPricingRule)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should not create a pricing rule with invalid data', async () => {
            const invalidRule = {
                name: '',
                description: 'Test',
                discountType: 'INVALID_TYPE'
            };

            const response = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(invalidRule)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/pricing-rules', () => {
        it('should return all pricing rules', async () => {
            const rules = [
                validPricingRule,
                {
                    ...validPricingRule,
                    name: 'Rule 2',
                    discountType: DiscountType.BUY_X_GET_Y,
                    conditions: { minQuantity: 3, payQuantity: 2 }
                }
            ];

            await Promise.all(rules.map(rule =>
                request(app)
                    .post('/api/pricing-rules')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(rule)
            ));

            const response = await request(app)
                .get('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('discountType');
        });

        it('should not return pricing rules without authentication', async () => {
            const response = await request(app)
                .get('/api/pricing-rules')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /api/pricing-rules/:id', () => {
        it('should return a specific pricing rule by id', async () => {
            const createResponse = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule);

            const response = await request(app)
                .get(`/api/pricing-rules/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.name).toBe(validPricingRule.name);
        });

        it('should return 404 for non-existent pricing rule', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/pricing-rules/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Pricing rule not found');
        });
    });

    describe('PUT /api/pricing-rules/:id', () => {
        it('should update a pricing rule successfully', async () => {
            const createResponse = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule);

            const updateData = {
                name: 'Updated Rule',
                priority: 5
            };

            const response = await request(app)
                .put(`/api/pricing-rules/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.name).toBe(updateData.name);
            expect(response.body.priority).toBe(updateData.priority);
        });

        it('should not update a non-existent pricing rule', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/pricing-rules/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Updated Name' })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Pricing rule not found');
        });
    });

    describe('DELETE /api/pricing-rules/:id', () => {
        it('should delete a pricing rule successfully', async () => {
            const createResponse = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule);

            await request(app)
                .delete(`/api/pricing-rules/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(204);

            const getResponse = await request(app)
                .get(`/api/pricing-rules/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(getResponse.body).toHaveProperty('error', 'Pricing rule not found');
        });
    });

    describe('PATCH /api/pricing-rules/:id/deactivate', () => {
        it('should deactivate a pricing rule successfully', async () => {
            const createResponse = await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule);

            const response = await request(app)
                .patch(`/api/pricing-rules/${createResponse.body._id}/deactivate`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.isActive).toBe(false);
        });
    });

    describe('GET /api/pricing-rules/search', () => {
        it('should search pricing rules by text', async () => {
            await request(app)
                .post('/api/pricing-rules')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validPricingRule);

            const response = await request(app)
                .get('/api/pricing-rules/search?q=Test')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toBe(validPricingRule.name);
        });

        it('should return 400 without search query', async () => {
            const response = await request(app)
                .get('/api/pricing-rules/search')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });
});