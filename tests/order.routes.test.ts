import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Order } from '../src/models/order.model';
import { Product } from '../src/models/product.model';
import { User } from '../src/models/user.model';
import { generateTokens } from '../src/utils/jwt.utils';
import './setup';

describe('Order Routes', () => {
    let accessToken: string;
    let userId: string;
    let user2AccessToken: string;

    beforeAll(async () => {
        const user1 = await User.create({
            name: 'Test User 1',
            email: 'test1@example.com',
            password: 'password123'
        });
        userId = user1._id.toString();
        const tokens1 = await generateTokens(user1);
        accessToken = tokens1.accessToken;

        const user2 = await User.create({
            name: 'Test User 2',
            email: 'test2@example.com',
            password: 'password123'
        });
        const tokens2 = await generateTokens(user2);
        user2AccessToken = tokens2.accessToken;
    });

    beforeEach(async () => {
        await Order.deleteMany({});
        await Product.insertMany([
            { sku: 'ipd', name: 'Super iPad', price: 549.99 },
            { sku: 'atv', name: 'Apple TV', price: 109.5 },
            { sku: 'vga', name: 'VGA adapter', price: 30.0 }
        ]);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
    });

    describe('POST /api/orders', () => {
        it('should not create order without authentication', async () => {
            const response = await request(app)
                .post('/api/orders')
                .send({ customerName: 'John Doe', items: ['ipd'] })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should not create order with invalid token', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', 'Bearer invalid-token')
                .send({ customerName: 'John Doe', items: ['ipd'] })
                .expect(403);

            expect(response.body).toHaveProperty('error');
        });

        it('should not create order with missing customer name', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ items: ['ipd'] })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not create order with empty items array', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'John Doe', items: [] })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not create order with invalid SKUs', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'Test Customer', items: ['invalid-sku'] })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should create order successfully with valid data', async () => {
            const response = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'John Doe', items: ['ipd', 'atv'] })
                .expect(201);

            expect(response.body).toHaveProperty('_id');
            expect(response.body).toHaveProperty('userId', userId);
            expect(response.body).toHaveProperty('customerName', 'John Doe');
            expect(response.body).toHaveProperty('total');
            expect(response.body.total).toBeGreaterThan(0);
        });
    });

    describe('GET /api/orders', () => {
        it('should return empty array when user has no orders', async () => {
            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should not return orders without authentication', async () => {
            const response = await request(app)
                .get('/api/orders')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should return user orders when orders exist', async () => {
            await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'User Order', items: ['ipd'] });

            const response = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].userId).toBe(userId);
        });
    });

    describe('GET /api/orders/:id', () => {
        it('should return 404 for non-existent order', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/orders/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Order not found');
        });

        it('should return 400 for invalid order ID format', async () => {
            const response = await request(app)
                .get('/api/orders/invalid-id')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should get order details with correct ID', async () => {
            const createResponse = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'Test Customer', items: ['ipd', 'atv'] });

            const orderId = createResponse.body._id;

            const response = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('_id', orderId);
            expect(response.body).toHaveProperty('customerName', 'Test Customer');
            expect(response.body).toHaveProperty('items');
            expect(response.body.items).toHaveLength(2);
            expect(response.body).toHaveProperty('total');
            expect(response.body.total).toBeGreaterThan(0);
            expect(response.body).toHaveProperty('userId', userId);
        });

        it('should return 403 when accessing another user order', async () => {
            const orderResponse = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'User1 Order', items: ['ipd'] });

            const orderId = orderResponse.body._id;

            const response = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${user2AccessToken}`)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Access denied');
        });
    });

    describe('DELETE /api/orders/:id', () => {
        it('should return 404 when deleting non-existent order', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/orders/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Order not found');
        });

        it('should delete order successfully', async () => {
            const orderResponse = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'Test Order', items: ['ipd'] });

            const orderId = orderResponse.body._id;

            const response = await request(app)
                .delete(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Order deleted successfully');

            await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });

        it('should return 403 when deleting another user order', async () => {
            const orderResponse = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'User1 Order', items: ['ipd'] });

            const orderId = orderResponse.body._id;

            const response = await request(app)
                .delete(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${user2AccessToken}`)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Access denied');
        });
    });

    describe('Happy Path Scenarios', () => {
        it('should handle complete order lifecycle', async () => {
            const createResponse = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ customerName: 'Lifecycle Test', items: ['ipd', 'atv'] })
                .expect(201);

            const orderId = createResponse.body._id;
            expect(createResponse.body.total).toBeGreaterThan(0);

            const getResponse = await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(getResponse.body._id).toBe(orderId);

            await request(app)
                .delete(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            await request(app)
                .get(`/api/orders/${orderId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });
});