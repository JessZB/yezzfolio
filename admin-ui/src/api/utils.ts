/**
 * Extracts Google Drive ID from a full URL or returns the string if it looks like an ID already.
 * Pattern matches: /file/d/ID/ or ?id=ID
 */
export const extract_drive_id = (input: string): string => {
  const clean = input.trim();
  if (!clean) return '';
  
  // Pattern 1: .../file/d/ID/...
  const match1 = clean.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  
  // Pattern 2: id=ID
  const match2 = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  
  // If no URL pattern found, assume it is already an ID (alphanumeric/hyphen/underscore)
  // and has a length typical for Drive IDs (~33 chars)
  return clean;
};
