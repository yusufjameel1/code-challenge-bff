import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import request from 'supertest';
import app from '../src/app';
import { User } from '../src/models/user.model';

export const createTestUser = async (email: string = 'test@example.com', password: string = 'password123') => {
    const user = new User({
        _id: new Types.ObjectId(),
        email,
        password,
    });
    await user.save();
    return user;
};

export const generateTestToken = (userId: string) => {
    const secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key';
    const accessToken = jwt.sign({ userId }, secretKey, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId }, secretKey, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const testRequest = request(app);