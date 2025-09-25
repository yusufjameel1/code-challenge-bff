import { Response, Request } from 'express';
import { AuthRequest } from '../types/request.types';
import { AuthService } from '../services/auth.service';
import { IUserDocument } from '@/types/user.types';

export class AuthController {
    private static instance: AuthController;
    private authService: AuthService;

    private constructor() {
        this.authService = AuthService.getInstance();
    }

    /**
     * Get the singleton instance of AuthController
     */
    public static getInstance(): AuthController {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }

    /**
     * Register a new user
     */
    public async register(req: Request, res: Response): Promise<void> {
        try {
            const iUser: IUserDocument = req.body;
            const user = await this.authService.register(iUser);
            const tokens = await this.authService.refreshToken(user._id);

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
                res.status(400).json({ error: 'Email already registered' });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Login a user
     */
    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const { user, tokens } = await this.authService.login(email, password);

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
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    /**
     * Refresh user's token
     */
    public async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                res.status(400).json({ error: 'Refresh token is required' });
                return;
            }

            const { tokens, user } = await this.authService.processRefreshToken(refreshToken);

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
                res.status(403).json({ error: 'Invalid refresh token' });
                return;
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}