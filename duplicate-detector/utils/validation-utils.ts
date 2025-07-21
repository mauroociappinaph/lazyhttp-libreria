// Validation utility functions

import { existsSync } from 'fs';
import { extname } from 'path';

export function isValidThreshold(threshold: unknown): threshold is number {
  return typeof threshold === 'number' &&
         threshold >= 0 &&
         threshold <= 1 &&
         !Number.isNaN(threshold) &&
         Number.isFinite(threshold);
}

export function isValidFilePath(filePath: unknown): filePath is string {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return false;
  }

  // Check for invalid characters in file paths
  const invalidChars = /[<>:"|?*]/;
  return !invalidChars.test(filePath);
}

export function isValidFileExtension(filePath: string, allowedExtensions: string[]): boolean {
  if (!isValidFilePath(filePath)) {
    return false;
  }

  const ext = extname(filePath).toLowerCase();
  return allowedExtensions.includes(ext);
}

export function fileExists(filePath: string): boolean {
  try {
    return existsSync(filePath);
  } catch {
    return false;
  }
}

export function isValidArray<T>(arr: unknown, validator?: (item: unknown) => item is T): arr is T[] {
  if (!Array.isArray(arr)) {
    return false;
  }

  if (validator) {
    return arr.every(validator);
  }

  return true;
}

export function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' &&
         value > 0 &&
         !Number.isNaN(value) &&
         Number.isFinite(value);
}

export function isValidNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' &&
         value >= 0 &&
         !Number.isNaN(value) &&
         Number.isFinite(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' &&
         value !== null &&
         !Array.isArray(value);
}

export function isValidRegexPattern(pattern: string): boolean {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

export interface ValidationResult<T> {
  isValid: boolean;
  value?: T;
  errors: string[];
}

export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (obj[field] === undefined || obj[field] === null) {
      missingFields.push(String(field));
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

export function validateWithSchema<T>(
  value: unknown,
  validators: Record<string, (val: unknown) => boolean>,
  required: string[] = []
): ValidationResult<T> {
  const errors: string[] = [];

  if (!isValidObject(value)) {
    return {
      isValid: false,
      errors: ['Value must be an object']
    };
  }

  // Check required fields
  for (const field of required) {
    if (!(field in value) || value[field] === undefined || value[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate each field
  for (const [field, validator] of Object.entries(validators)) {
    if (field in value && !validator(value[field])) {
      errors.push(`Invalid value for field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    value: errors.length === 0 ? (value as T) : undefined,
    errors
  };
}
