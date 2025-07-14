import { errorHandler } from '../../../../http/helpers/error/error-handler';
import {
  HttpTimeoutError,
  HttpAbortedError,
  HttpNetworkError,
} from '../../../../http/http-errors';
import { httpLogger } from '../../../../http/http-logger';
import { AxiosError, AxiosHeaders } from 'axios';

// Mock del logger para evitar side effects en los tests
jest.mock('../../../../http/http-logger', () => ({
  httpLogger: {
    logError: jest.fn(),
  },
}));

describe('errorHandler', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    (httpLogger.logError as jest.Mock).mockClear();
  });

  it('should handle HttpTimeoutError correctly', () => {
    const timeoutError = new HttpTimeoutError('Request timed out');
    const response = errorHandler.handleError(timeoutError);

    expect(response).toEqual({
      data: null,
      error: 'La solicitud ha excedido el tiempo de espera configurado',
      status: 408,
      details: expect.any(Object),
    });
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle AxiosError correctly', () => {
    const axiosError = new AxiosError(
      'Network Error',
      'ERR_NETWORK',
      { // config
        url: '/',
        method: 'get',
        headers: new AxiosHeaders(), // Use AxiosHeaders
        timeout: 0,
      },
      undefined, // request
      { // response
        status: 500,
        statusText: 'Internal Server Error',
        headers: new AxiosHeaders(), // Use AxiosHeaders
        data: 'Server Error',
        config: {
          url: '/',
          method: 'get',
          headers: new AxiosHeaders(), // Use AxiosHeaders
          timeout: 0,
        },
      }
    );
    const response = errorHandler.handleError(axiosError);

    expect(response.data).toBeNull();
    expect(response.error).toBe('Error en la petición HTTP realizada con Axios');
    expect(response.status).toBe(500);
    expect(response.details).toBeDefined();
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle HttpAbortedError correctly', () => {
    const abortedError = new HttpAbortedError('Request aborted');
    const response = errorHandler.handleError(abortedError);

    expect(response).toEqual({
      data: null,
      error: 'La petición fue cancelada antes de completarse',
      status: 0,
      details: expect.any(Object),
    });
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle HttpAuthError (TokenExpired) correctly', () => {
    const authError = new Error('TokenExpired');
    const response = errorHandler.handleError(authError);

    expect(response.data).toBeNull();
    expect(response.error).toBe('Error de autenticación o sesión expirada');
    expect(response.status).toBe(401);
    expect(response.details).toBeDefined();
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle generic Error correctly', () => {
    const genericError = new Error('Something went wrong');
    const response = errorHandler.handleError(genericError);

    expect(response.data).toBeNull();
    expect(response.error).toBe('Something went wrong');
    expect(response.status).toBe(0);
    expect(response.details).toBeUndefined(); // No details for generic Error
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle HttpNetworkError correctly', () => {
    const networkError = new HttpNetworkError('Network issue');
    const response = errorHandler.handleError(networkError);

    expect(response.data).toBeNull();
    expect(response.error).toBe('Network issue');
    expect(response.status).toBe(0);
    expect(response.details).toBeDefined();
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });

  it('should handle unknown errors correctly', () => {
    const unknownError = 'Just a string error';
    const response = errorHandler.handleError(unknownError);

    expect(response.data).toBeNull();
    expect(response.error).toBe('Error desconocido durante la petición HTTP');
    expect(response.status).toBe(0);
    expect(response.details).toBeDefined();
    expect(httpLogger.logError).toHaveBeenCalledWith(response);
  });
});

