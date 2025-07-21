// Hash utility functions

import { createHash } from 'crypto';
import { isNonEmptyString } from './validation-utils';

/**
 * Generates a SHA-256 hash for the given content
 * @param content - The content to hash
 * @param algorithm - The hash algorithm to use (default: 'sha256')
 * @returns The hexadecimal hash string
 */
export function generateHash(content: string, algorithm: string = 'sha256'): string {
  if (!isNonEmptyString(content)) {
    throw new Error('Content must be a non-empty string');
  }

  try {
    return createHash(algorithm).update(content, 'utf8').digest('hex');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate hash: ${errorMessage}`);
  }
}

/**
 * Generates a short hash (first 8 characters) for quick comparison
 * @param content - The content to hash
 * @param length - The length of the short hash (default: 8)
 * @returns The shortened hash string
 */
export function generateShortHash(content: string, length: number = 8): string {
  if (length <= 0 || length > 64) {
    throw new Error('Hash length must be between 1 and 64 characters');
  }

  const fullHash = generateHash(content);
  return fullHash.substring(0, length);
}

/**
 * Securely compares two hash strings to prevent timing attacks
 * @param hash1 - First hash to compare
 * @param hash2 - Second hash to compare
 * @returns True if hashes are equal, false otherwise
 */
export function compareHashes(hash1: string, hash2: string): boolean {
  if (!isNonEmptyString(hash1) || !isNonEmptyString(hash2)) {
    return false;
  }

  // Ensure both hashes are the same length to prevent timing attacks
  if (hash1.length !== hash2.length) {
    return false;
  }

  // Use constant-time comparison
  let result = 0;
  for (let i = 0; i < hash1.length; i++) {
    result |= hash1.charCodeAt(i) ^ hash2.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generates a hash for code normalization (removes whitespace and comments)
 * @param code - The code content to normalize and hash
 * @returns The hash of the normalized code
 */
export function generateNormalizedCodeHash(code: string): string {
  if (!isNonEmptyString(code)) {
    throw new Error('Code must be a non-empty string');
  }

  // Basic normalization: remove extra whitespace and normalize line endings
  const normalizedCode = code
    .replace(/\r\n/g, '\n')           // Normalize line endings
    .replace(/\s+/g, ' ')             // Collapse multiple spaces
    .replace(/\s*([{}();,])\s*/g, '$1') // Remove spaces around punctuation
    .trim();

  return generateHash(normalizedCode);
}
