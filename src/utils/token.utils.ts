import jwt from 'jsonwebtoken';
import { IUser } from '../types/user.types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

export const generateTokens = (user: IUser) => {
    const accessToken = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user._id },
        REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): { userId: string; email: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
};

export const verifyRefreshToken = (token: string): { userId: string } => {
    return jwt.verify(token, REFRESH_SECRET) as { userId: string };
};