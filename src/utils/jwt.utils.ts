import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/user.types';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'your-access-token-secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-token-secret';

export const generateTokens = (payload: { userId: string; email: string }) => {
    // Generate access token (1 hour expiry)
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
        expiresIn: '1h',
    });

    // Generate refresh token (7 days expiry)
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: '7d',
    });

    return { accessToken, refreshToken };
};

export const verifyAccessToken = (token: string): JwtPayload => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;
};