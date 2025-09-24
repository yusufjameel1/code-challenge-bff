import request from 'supertest';
import { Express } from 'express';
import mongoose from 'mongoose';
import app from '../src/app';
import { User } from '../src/models/user.model';
import './setup';

describe('Auth Routes', () => {

    beforeEach(async () => {
        await User.deleteMany({});
    });

    describe('POST /api/auth/register', () => {
        const validUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        it('should register a new user successfully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(201);

            // Check response structure
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('id');
            expect(response.body.user).toHaveProperty('name', validUser.name);
            expect(response.body.user).toHaveProperty('email', validUser.email);

            // Verify user was created in database
            const user = await User.findOne({ email: validUser.email });
            expect(user).toBeTruthy();
            expect(user?.name).toBe(validUser.name);
        });

        it('should not register a user with existing email', async () => {
            // First registration
            await request(app)
                .post('/api/auth/register')
                .send(validUser);

            // Attempt to register with same email
            const response = await request(app)
                .post('/api/auth/register')
                .send(validUser)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Email already registered');
        });

        it('should not register a user with invalid data', async () => {
            const invalidUser = {
                name: 'Test User',
                email: 'invalid-email',
                password: '123' // Too short password
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(invalidUser)
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('POST /api/auth/login', () => {
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/register')
                .send(testUser);
        });

        it('should login successfully with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
        });

        it('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });

        it('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: testUser.password
                })
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        });
    });

    describe('POST /api/auth/refresh-token', () => {
        let refreshToken: string;
        const testUser = {
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        };

        beforeEach(async () => {
            // Create a user and get tokens
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            refreshToken = response.body.refreshToken;
        });

        it('should refresh tokens successfully with valid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken })
                .expect(200);

            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('email', testUser.email);
        });

        it('should not refresh tokens with invalid refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({ refreshToken: 'invalid-token' })
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Invalid refresh token');
        });

        it('should not refresh tokens without refresh token', async () => {
            const response = await request(app)
                .post('/api/auth/refresh-token')
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Refresh token is required');
        });
    });
});