import sanitizeHtml from 'sanitize-html';

/**
 * Sanitize Utility
 * Strips all HTML tags and dangerous attributes from a string.
 */
export function clean(text: string | null | undefined): string | null | undefined {
  if (!text) return text;
  
  return sanitizeHtml(text, {
    allowedTags: [], // Strip all tags by default for security
    allowedAttributes: {},
  });
}

/**
 * Sanitizes an object by cleaning all string properties.
 */
export function cleanObject<T extends object>(obj: T): T {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      cleaned[key] = clean(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      cleaned[key] = cleanObject(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned as T;
}
