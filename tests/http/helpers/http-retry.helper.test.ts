import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { retryHandler } from '../../../http/helpers/http-retry.helper';
import { HttpNetworkError } from '../../../http/http-errors';
import axios, { AxiosError, AxiosResponse, AxiosHeaders } from 'axios';


describe('retryHandler.isRetryableError', () => {
  it('returns true for HttpNetworkError', () => {
    expect(retryHandler.isRetryableError(new HttpNetworkError('fail'))).toBe(true);
  });

  it('returns true for AxiosError with no response', () => {
    const error = new AxiosError('fail', 'ERR_NETWORK');
    expect(retryHandler.isRetryableError(error)).toBe(true);
  });

  it('returns true for AxiosError with 5xx', () => {
    const error = new AxiosError('fail', 'ERR_BAD_RESPONSE', undefined, undefined, { status: 500 } as any);
    error.response = { status: 500 } as any;
    expect(retryHandler.isRetryableError(error)).toBe(true);
  });

  it('returns true for AxiosError with 429', () => {
    const error = new AxiosError('fail', 'ERR_TOO_MANY_REQUESTS', undefined, undefined, { status: 429 } as any);
    error.response = { status: 429 } as any;
    expect(retryHandler.isRetryableError(error)).toBe(true);
  });

  it('returns false for non-retryable error', () => {
    expect(retryHandler.isRetryableError(new Error('fail'))).toBe(false);
  });
});

describe('retryHandler.waitForRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  it('waits the expected time (exponential backoff)', async () => {
    const promise = retryHandler.waitForRetry(3); // 2^(5-3)*100 = 400ms
    jest.advanceTimersByTime(400);
    await expect(promise).resolves.toBeUndefined();
  });
});

describe('retryHandler.executeWithRetry', () => {
  let axiosRequestSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    axiosRequestSpy = jest.spyOn(axios, 'request');
  });

  afterEach(() => {
    axiosRequestSpy.mockRestore();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('returns response on first try', async () => {
    const mockHeaders = new AxiosHeaders();
    const mockResponse: AxiosResponse<string> = {
      data: 'ok',
      status: 200,
      statusText: 'OK',
      headers: mockHeaders,
      config: { headers: mockHeaders },
    };
    axiosRequestSpy.mockResolvedValue(mockResponse);
    const resp = await retryHandler.executeWithRetry('url', 'GET', {}, undefined, 1000, 2);
    expect(resp.data).toBe('ok');
  });

  it('retries on retryable error and succeeds', async () => {
    const mockHeaders = new AxiosHeaders();
    const error = new AxiosError('fail', 'ERR_NETWORK');
    const mockResponse: AxiosResponse<string> = {
      data: 'ok',
      status: 200,
      statusText: 'OK',
      headers: mockHeaders,
      config: { headers: mockHeaders },
    };

    // First call to axios.request will reject
    axiosRequestSpy.mockRejectedValueOnce(error);
    axiosRequestSpy.mockResolvedValueOnce(mockResponse);

    const promise = retryHandler.executeWithRetry('url', 'GET', {}, undefined, 1000, 2);
    await jest.runAllTimersAsync(); // Advance timers for the retry
    const resp = await promise;
    expect(resp.data).toBe('ok');
    expect(axiosRequestSpy).toHaveBeenCalledTimes(2); // Expect two calls: one failed, one succeeded
  });

  it('throws after exhausting retries', async () => {
    const mockHeaders = new AxiosHeaders();
    const error = new AxiosError('fail', 'ERR_NETWORK', undefined, undefined, { headers: mockHeaders } as any);
    axiosRequestSpy.mockRejectedValue(error);
    await expect(retryHandler.executeWithRetry('url', 'GET', {}, undefined, 1000, 1)).rejects.toThrow('fail');
  });
});
