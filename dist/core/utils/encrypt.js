import crypto from 'crypto';
import { env } from '../../config/env.js';
/**
 * Encryption Utility
 * Used to securely store sensitive data (like Google Drive Refresh Tokens) in the database.
 * Uses AES-256-CBC encryption.
 */
const ENCRYPTION_KEY = env.JWT_SECRET || 'fallback_secret_key_32_chars_long_!!!';
const IV_LENGTH = 16;
/**
 * Encrypts a plain string into a hex string with IV.
 */
export function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    // Ensure key is 32 bytes
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}
/**
 * Decrypts an IV-prefixed hex string back to plain text.
 */
export function decrypt(text) {
    const textParts = text.split(':');
    const ivStr = textParts.shift();
    if (!ivStr)
        throw new Error('Invalid encryption format');
    const iv = Buffer.from(ivStr, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
//# sourceMappingURL=encrypt.js.map