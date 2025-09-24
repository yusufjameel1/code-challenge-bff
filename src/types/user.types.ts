export interface IUser {
    name: string;
    email: string;
    password: string;
}

export interface IUserDocument extends IUser {
    _id: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}export interface JwtPayload {
    userId: string;
    email: string;
}