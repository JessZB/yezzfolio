/**
 * Encrypts a plain string into a hex string with IV.
 */
export declare function encrypt(text: string): string;
/**
 * Decrypts an IV-prefixed hex string back to plain text.
 */
export declare function decrypt(text: string): string;
