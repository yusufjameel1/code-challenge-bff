import { Request } from 'express';
import { JwtPayload } from './user.types';

export interface AuthRequest extends Request {
    user?: JwtPayload;
}