// Hash utility functions

import { createHash } from 'crypto';

export function generateHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function generateShortHash(content: string): string {
  return generateHash(content).substring(0, 8);
}

export function compareHashes(hash1: string, hash2: string): boolean {
  return hash1 === hash2;
}
