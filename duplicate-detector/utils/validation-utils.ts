// Validation utility functions

export function isValidThreshold(threshold: number): boolean {
  return typeof threshold === 'number' && threshold >= 0 && threshold <= 1;
}

export function isValidFilePath(filePath: string): boolean {
  return typeof filePath === 'string' && filePath.length > 0;
}

export function isValidArray<T>(arr: unknown): arr is T[] {
  return Array.isArray(arr);
}

export function isValidPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && !Number.isNaN(value) && Number.isFinite(value);
}

export function isValidNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && value >= 0 && !Number.isNaN(value) && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
