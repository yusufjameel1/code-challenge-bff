export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
}

export interface IUserDocument extends Omit<IUser, '_id'> {
    _id: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface JwtPayload {
    userId: string;
    email: string;
}

export interface IAuthTokens {
    accessToken: string;
    refreshToken: string;
}