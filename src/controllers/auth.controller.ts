import { Response } from 'express';
import { AuthRequest } from '../types/request.types';
import { authService } from '../services/auth.service';


export const register = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const user = await authService.register(name, email, password);
        const tokens = await authService.refreshToken(user._id);

        res.status(201).json({
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error: any) {
        if (error.message === 'User already exists') {
            return res.status(400).json({ error: 'Email already registered' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const login = async (req: AuthRequest, res: Response) => {
    try {
        const { email, password } = req.body;
        const { user, tokens } = await authService.login(email, password);

        res.json({
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error: any) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token is required' });
        }

        const { tokens, user } = await authService.processRefreshToken(refreshToken);

        res.json({
            ...tokens,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error: any) {
        if (error.message === 'Invalid refresh token') {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};