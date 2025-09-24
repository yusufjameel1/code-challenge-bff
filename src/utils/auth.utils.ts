import * as crypto from 'crypto';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';
const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(SECRET_KEY.padEnd(32).slice(0, 32)); // Ensure key is exactly 32 bytes

export const hashPassword = async (password: string): Promise<string> => {
    try {
        console.log('[AuthUtils] Starting password encryption...');

        // Generate a new IV for each encryption
        const iv = crypto.randomBytes(16);

        // Create cipher with IV
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

        // Encrypt the password
        let encrypted = cipher.update(password, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        // Store IV with the encrypted password
        const result = iv.toString('base64') + ':' + encrypted;

        console.log('[AuthUtils] Password encrypted successfully');
        return result;
    } catch (error: any) {
        console.error('[AuthUtils] Error encrypting password:', error.message);
        throw error;
    }
};

export const comparePasswords = async (password: string, storedValue: string): Promise<boolean> => {
    try {
        console.log('[AuthUtils] Starting password comparison...');

        if (!password || !storedValue) {
            console.error('[AuthUtils] Missing password or stored value');
            return false;
        }

        // Split IV and encrypted password
        const [ivString, encryptedPassword] = storedValue.split(':');
        if (!ivString || !encryptedPassword) {
            console.error('[AuthUtils] Invalid stored password format');
            return false;
        }

        // Convert IV from base64
        const iv = Buffer.from(ivString, 'base64');

        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);

        // Decrypt the stored password
        let decrypted = decipher.update(encryptedPassword, 'base64', 'utf8');
        decrypted += decipher.final('utf8');

        // Compare the passwords
        const isMatch = password === decrypted;
        console.log('[AuthUtils] Password comparison result:', { isMatch });

        return isMatch;
    } catch (error: any) {
        console.error('[AuthUtils] Error comparing passwords:', error.message);
        return false;
    }
};