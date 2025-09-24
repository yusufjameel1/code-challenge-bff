import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/jwt.config';
import { IUser } from '@/types/user.types';

/**
 * Payload interface for JWT tokens
 */
export interface TokenPayload {
    userId: string;
    email: string;
}

/**
 * Response interface for token generation
 */
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
}

/**
 * Converts a time string with unit (e.g., '1h', '7d') to seconds
 */
function convertExpiryToSeconds(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
        case 'h':
            return value * 60 * 60;
        case 'd':
            return value * 24 * 60 * 60;
        default:
            throw new Error('Unsupported expiry unit. Use h for hours or d for days.');
    }
}

/**
 * Generates a JWT token with the given payload and expiry
 */
function generateToken(payload: TokenPayload, secret: Secret, expiry: string): string {
    return jwt.sign(payload, secret, {
        expiresIn: convertExpiryToSeconds(expiry)
    });
}

/**
 * Generates an access token
 */
function generateAccessToken(payload: TokenPayload): string {
    return generateToken(
        payload,
        JWT_CONFIG.ACCESS_TOKEN_SECRET,
        JWT_CONFIG.ACCESS_TOKEN_EXPIRY
    );
}

/**
 * Generates a refresh token
 */
function generateRefreshToken(payload: TokenPayload): string {
    return generateToken(
        payload,
        JWT_CONFIG.REFRESH_TOKEN_SECRET,
        JWT_CONFIG.REFRESH_TOKEN_EXPIRY
    );
}

/**
 * Generates both access and refresh tokens for a user
 */
export function generateTokens(payload: IUser): TokenResponse {
    try {
        console.log('[JWTUtils] Generating tokens for user:', payload.email);

        const accessToken = generateAccessToken({ userId: payload._id, email: payload.email });
        const refreshToken = generateRefreshToken({ userId: payload._id, email: payload.email });

        console.log('[JWTUtils] Tokens generated successfully');
        return { accessToken, refreshToken };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JWTUtils] Error generating tokens:', errorMessage);
        throw new Error('Failed to generate authentication tokens');
    }
}

/**
 * Verifies a JWT token and returns the payload
 */
function verifyToken(token: string, secret: Secret): TokenPayload {
    try {
        const decoded = jwt.verify(token, secret);
        return decoded as TokenPayload;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[JWTUtils] Token verification failed:', errorMessage);
        throw new Error('Invalid or expired token');
    }
}

/**
 * Verifies an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
    console.log('[JWTUtils] Verifying access token');
    return verifyToken(token, JWT_CONFIG.ACCESS_TOKEN_SECRET);
}

/**
 * Verifies a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
    console.log('[JWTUtils] Verifying refresh token');
    return verifyToken(token, JWT_CONFIG.REFRESH_TOKEN_SECRET);
}