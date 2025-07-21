// File utility functions

import { promises as fs } from 'fs';
import { join, extname } from 'path';

export async function readFileContent(filePath: string): Promise<string> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`);
  }
}

export function isTypeScriptFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ['.ts', '.tsx'].includes(ext);
}

export function isJavaScriptFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return ['.js', '.jsx'].includes(ext);
}

export function isSupportedFile(filePath: string): boolean {
  return isTypeScriptFile(filePath) || isJavaScriptFile(filePath);
}

export async function getFileStats(filePath: string) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    throw new Error(`Failed to get stats for file ${filePath}: ${error}`);
  }
}
