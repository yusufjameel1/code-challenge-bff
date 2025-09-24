import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils';
import { User } from '../models/user.model';
import { IAuthTokens, IUserDocument } from '../types/user.types';

class AuthService {
    async register(name: string, email: string, password: string): Promise<IUserDocument> {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = new User({
            name,
            email,
            password,
        });

        await user.save();
        return user;
    }

    async login(email: string, password: string): Promise<{ user: IUserDocument; tokens: IAuthTokens }> {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isPasswordValid = await user.comparePassword(password);

            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }

            const tokens = generateTokens(user);
            return { user, tokens };
        } catch (error: any) {
            throw error;
        }
    }

    async refreshToken(userId: string): Promise<IAuthTokens> {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return generateTokens(user);
    }

    async processRefreshToken(refreshToken: string): Promise<{ tokens: IAuthTokens, user: IUserDocument }> {
        try {
            const decoded = verifyRefreshToken(refreshToken);
            const user = await User.findById(decoded.userId);

            if (!user) {
                throw new Error('Invalid refresh token');
            }

            const tokens = generateTokens(user);
            return { tokens, user };
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
}

export const authService = new AuthService();