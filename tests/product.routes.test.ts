import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app';
import { Product } from '../src/models/product.model';
import { User } from '../src/models/user.model';
import { generateTokens } from '../src/utils/jwt.utils';
import { IProduct } from '@/types/product.types';

describe('Product Routes', () => {
    let accessToken: string;
    let userId: string;

    const validProduct = {
        sku: 'ipd',
        name: 'Super iPad',
        price: 549.99
    };

    beforeAll(async () => {
        // Create a test user and generate tokens
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
        // Clear all products before each test
        await Product.deleteMany({});
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({});
        await Product.deleteMany({});
    });

    describe('POST /api/products', () => {
        it('should create a new product successfully', async () => {
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct)
                .expect(201);

            expect(response.body).toMatchObject({
                sku: validProduct.sku,
                name: validProduct.name,
                price: validProduct.price
            });
            expect(response.body._id).toBeDefined();
        });

        it('should not create a product with duplicate SKU', async () => {
            // First create a product
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            // Try to create another product with same SKU
            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Product with this SKU already exists');
        });

        it('should not create a product without authentication', async () => {
            const response = await request(app)
                .post('/api/products')
                .send(validProduct)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });

        it('should not create a product with invalid data', async () => {
            const invalidProduct = {
                sku: '',  // Empty SKU
                name: 'Test Product',
                price: 'invalid'  // Invalid price
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(invalidProduct)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not create product with missing required fields', async () => {
            const incompleteProduct = {
                sku: 'test-sku'
                // Missing name and price
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(incompleteProduct)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not create product with negative price', async () => {
            const invalidProduct = {
                sku: 'test-sku',
                name: 'Test Product',
                price: -100
            };

            const response = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(invalidProduct)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('GET /api/products', () => {
        it('should return all products', async () => {
            // Create some test products
            const products = [
                validProduct,
                { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
                { sku: 'atv', name: 'Apple TV', price: 109.50 }
            ];

            await Promise.all(products.map(product =>
                request(app)
                    .post('/api/products')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(product)
            ));

            const response = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(3);
            expect(response.body[0]).toHaveProperty('sku');
            expect(response.body[0]).toHaveProperty('name');
            expect(response.body[0]).toHaveProperty('price');
        });

        it('should not return products without authentication', async () => {
            const response = await request(app)
                .get('/api/products')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /api/products/:id', () => {
        it('should return a specific product by id', async () => {
            // Create a product first
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .get(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toMatchObject(validProduct);
        });

        it('should return 404 for non-existent product', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/products/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        it('should return 400 for invalid product ID format', async () => {
            const response = await request(app)
                .get('/api/products/invalid-id')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not return product without authentication', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .get(`/api/products/${createResponse.body._id}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('PUT /api/products/:id', () => {
        it('should update a product successfully', async () => {
            // Create a product first
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const updateData = {
                name: 'Updated iPad',
                price: 599.99
            };

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject({
                ...validProduct,
                ...updateData
            });
        });

        it('should update product SKU when unique', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ sku: 'new-sku' })
                .expect(200);

            expect(response.body.sku).toBe('new-sku');
        });

        it('should not update to duplicate SKU', async () => {
            const product1 = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const product2 = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ sku: 'mbp', name: 'MacBook Pro', price: 1399.99 });

            const response = await request(app)
                .put(`/api/products/${product2.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ sku: validProduct.sku })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Product with this SKU already exists');
        });

        it('should not update a non-existent product', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .put(`/api/products/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ name: 'Updated Name' })
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        it('should update product with same SKU (no conflict)', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ sku: validProduct.sku, name: 'Updated Name' })
                .expect(200);

            expect(response.body.name).toBe('Updated Name');
            expect(response.body.sku).toBe(validProduct.sku);
        });

        it('should update only provided fields', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ price: 999.99 })
                .expect(200);

            expect(response.body.price).toBe(999.99);
            expect(response.body.name).toBe(validProduct.name);
            expect(response.body.sku).toBe(validProduct.sku);
        });

        it('should not update without authentication', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .send({ name: 'Updated Name' })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('DELETE /api/products/:id', () => {
        it('should delete a product successfully', async () => {
            // Create a product first
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            await request(app)
                .delete(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            // Verify product is deleted
            const getResponse = await request(app)
                .get(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(getResponse.body).toHaveProperty('error', 'Product not found');
        });

        it('should not delete a non-existent product', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/api/products/${nonExistentId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        it('should not delete without authentication', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .delete(`/api/products/${createResponse.body._id}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /api/products/sku/:sku', () => {
        it('should return product by SKU', async () => {
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .get(`/api/products/sku/${validProduct.sku}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toMatchObject(validProduct);
        });

        it('should return 404 for non-existent SKU', async () => {
            const response = await request(app)
                .get('/api/products/sku/non-existent')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        it('should not return product by SKU without authentication', async () => {
            const response = await request(app)
                .get(`/api/products/sku/${validProduct.sku}`)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('GET /api/products/search', () => {
        it('should search products by name', async () => {
            const products = [
                validProduct,
                { sku: 'mbp', name: 'MacBook Pro', price: 1399.99 },
                { sku: 'atv', name: 'Apple TV', price: 109.50 }
            ];

            await Promise.all(products.map(product =>
                request(app)
                    .post('/api/products')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .send(product)
            ));

            const response = await request(app)
                .get('/api/products/search?q=iPad')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(1);
            expect(response.body[0].name).toContain('iPad');
        });

        it('should return empty array for no matches', async () => {
            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .get('/api/products/search?q=nonexistent')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toEqual([]);
        });

        it('should return 400 without search query', async () => {
            const response = await request(app)
                .get('/api/products/search')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should not search without authentication', async () => {
            const response = await request(app)
                .get('/api/products/search?q=test')
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Unauthorized');
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple products with same name', async () => {
            const product1 = { sku: 'sku1', name: 'Same Name', price: 100 };
            const product2 = { sku: 'sku2', name: 'Same Name', price: 200 };

            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(product1);

            await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(product2);

            const response = await request(app)
                .get('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveLength(2);
            expect(response.body.every((p: IProduct) => p.name === 'Same Name')).toBe(true);
        });

        it('should handle valid ObjectId that does not exist', async () => {
            const validObjectId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/api/products/${validObjectId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Product not found');
        });

        it('should handle empty update data', async () => {
            const createResponse = await request(app)
                .post('/api/products')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(validProduct);

            const response = await request(app)
                .put(`/api/products/${createResponse.body._id}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({})
                .expect(200);

            expect(response.body).toMatchObject(validProduct);
        });
    });
});