import { describe, it, expect } from '@jest/globals';
import { sanitizeHeaders, formatLogData, debugConfig } from '../../../http/helpers/http-logger.helper';

describe('sanitizeHeaders', () => {
  it('should redact Authorization Bearer tokens', () => {
    const headers = { Authorization: 'Bearer my-secret-token', 'X-Test': '1' };
    const result = sanitizeHeaders(headers);
    expect(result.Authorization).toBe('Bearer [REDACTED]');
    expect(result['X-Test']).toBe('1');
  });

  it('should not fail if Authorization is missing', () => {
    const headers = { 'X-Test': '1' };
    const result = sanitizeHeaders(headers);
    expect(result['X-Test']).toBe('1');
    expect(result.Authorization).toBeUndefined();
  });
});

describe('formatLogData', () => {
  const originalPretty = debugConfig.prettyPrintJSON;

  afterEach(() => {
    debugConfig.prettyPrintJSON = originalPretty;
  });

  it('should pretty print objects if enabled', () => {
    debugConfig.prettyPrintJSON = true;
    const obj = { a: 1, b: { c: 2 } };
    const result = formatLogData(obj);
    expect(result).toEqual({ a: 1, b: { c: 2 } });
    expect(result).not.toBe(obj); // Should be a clone
  });

  it('should return data as is if pretty print is off', () => {
    debugConfig.prettyPrintJSON = false;
    const obj = { a: 1 };
    const result = formatLogData(obj);
    expect(result).toBe(obj);
  });

  it('should return data as is if not an object', () => {
    debugConfig.prettyPrintJSON = true;
    expect(formatLogData('string')).toBe('string');
    expect(formatLogData(123)).toBe(123);
    expect(formatLogData(null)).toBe(null);
  });
});
