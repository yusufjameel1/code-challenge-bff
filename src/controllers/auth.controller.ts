import { Response } from 'express';
import { User } from '../models/user.model';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import { AuthRequest } from '../types/request.types';

export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
        });

        await user.save();

        const { accessToken, refreshToken } = generateTokens({
            userId: user._id,
            email: user.email,
        });

        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const { accessToken, refreshToken } = generateTokens({
            userId: user._id,
            email: user.email,
        });

        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}; export const logout = async (_req: AuthRequest, res: Response) => {
    // Since we're not storing refresh tokens in the database,
    // client is responsible for discarding the tokens
    res.json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Get user from database
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Generate new tokens
        const tokens = generateTokens({
            userId: user._id,
            email: user.email,
        });

        res.json({
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};