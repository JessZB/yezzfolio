/**
 * Sanitize Utility
 * Strips all HTML tags and dangerous attributes from a string.
 */
export declare function clean(text: string | null | undefined): string | null | undefined;
/**
 * Sanitizes an object by cleaning all string properties.
 */
export declare function cleanObject<T extends object>(obj: T): T;
