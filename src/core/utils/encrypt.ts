import crypto from 'crypto';
import { env } from '../../config/env.js';

/**
 * Encryption Utility
 * Used to securely store sensitive data (like Google Drive Refresh Tokens) in the database.
 * Uses AES-256-CBC encryption.
 */

const ENCRYPTION_KEY = env.ENCRYPTION_KEY;
const IV_LENGTH = 16;

/**
 * Encrypts a plain string into a hex string with IV.
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  // Use first 32 bytes of the validated encryption key
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * Decrypts an IV-prefixed hex string back to plain text.
 */
export function decrypt(text: string): string {
  const textParts = text.split(':');
  const ivStr = textParts.shift();
  if (!ivStr) throw new Error('Invalid encryption format');
  
  const iv = Buffer.from(ivStr, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  
  const key = Buffer.from(ENCRYPTION_KEY.slice(0, 32));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}
