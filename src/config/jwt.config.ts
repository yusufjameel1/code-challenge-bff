export const JWT_CONFIG = {
    ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET || 'your-secret-key-must-be-32-characters',
    ACCESS_TOKEN_EXPIRY: '1h',
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET || 'your-refresh-secret-key-must-be-32-characters',
    REFRESH_TOKEN_EXPIRY: '7d'
};