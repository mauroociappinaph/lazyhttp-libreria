import { BaseHttpClient } from '../../../../http/common/core/base-http-client';
import { RetryOptions } from '../../../../http/common/types';

// Clase concreta para poder probar la clase abstracta BaseHttpClient
class TestHttpClient extends BaseHttpClient {
  async request<T>() {
    // Implementación simple para satisfacer la clase abstracta
    return { data: {} as T, status: 200, headers: {} };
  }

  // Métodos públicos para probar los métodos protegidos
  public testCalculateRetryDelay(retryCount: number, options?: RetryOptions): number {
    return this.calculateRetryDelay(retryCount, options);
  }

  public testShouldRetry(error: any, retryCount: number, options?: RetryOptions): boolean {
    return this.shouldRetry(error, retryCount, options);
  }
}

describe('BaseHttpClient - Retry', () => {
  let httpClient: TestHttpClient;

  beforeEach(() => {
    httpClient = new TestHttpClient();
    // Inicializar con configuración básica
    httpClient.initialize({
      retry: {
        enabled: true,
        maxRetries: 3,
        initialDelay: 300,
        backoffFactor: 2,
        retryableStatusCodes: [429, 500, 503],
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
      }
    });
  });

  describe('calculateRetryDelay', () => {
    test('debería calcular correctamente el retraso con configuración por defecto', () => {
      // Arrange: Ya configurado en beforeEach

      // Act & Assert: Para retry 0, 1, 2
      expect(httpClient.testCalculateRetryDelay(0)).toBe(300); // Delay inicial
      expect(httpClient.testCalculateRetryDelay(1)).toBe(600); // 300 * (2^1)
      expect(httpClient.testCalculateRetryDelay(2)).toBe(1200); // 300 * (2^2)
    });

    test('debería usar las opciones de la petición sobre la configuración global', () => {
      // Arrange
      const options: RetryOptions = {
        initialDelay: 100,
        backoffFactor: 3
      };

      // Act & Assert
      expect(httpClient.testCalculateRetryDelay(1, options)).toBe(300); // 100 * (3^1)
      expect(httpClient.testCalculateRetryDelay(2, options)).toBe(900); // 100 * (3^2)
    });

    test('debería funcionar con valores por defecto si no hay configuración', () => {
      // Arrange
      const clientWithoutConfig = new TestHttpClient();

      // Act & Assert: Debería usar los valores por defecto
      expect(clientWithoutConfig.testCalculateRetryDelay(1)).toBeGreaterThan(0);
    });
  });

  describe('shouldRetry', () => {
    test('debería retornar true para errores HTTP reintentables', () => {
      // Arrange
      const error = { status: 503, message: 'Service Unavailable' };

      // Act & Assert
      expect(httpClient.testShouldRetry(error, 0)).toBe(true);
      expect(httpClient.testShouldRetry(error, 1)).toBe(true);
      expect(httpClient.testShouldRetry(error, 2)).toBe(true);
      // Excede el número máximo de reintentos
      expect(httpClient.testShouldRetry(error, 3)).toBe(false);
    });

    test('debería retornar false para errores HTTP no reintentables', () => {
      // Arrange
      const error = { status: 404, message: 'Not Found' };

      // Act & Assert
      expect(httpClient.testShouldRetry(error, 0)).toBe(false);
    });

    test('debería retornar true para errores de red reintentables', () => {
      // Arrange
      const error = { code: 'ECONNRESET', message: 'Connection reset' };

      // Act & Assert
      expect(httpClient.testShouldRetry(error, 0)).toBe(true);
    });

    test('debería retornar false si los reintentos están desactivados', () => {
      // Arrange
      httpClient.initialize({ retry: { enabled: false } });
      const error = { status: 503, message: 'Service Unavailable' };

      // Act & Assert
      expect(httpClient.testShouldRetry(error, 0)).toBe(false);
    });

    test('debería usar las opciones de la petición sobre la configuración global', () => {
      // Arrange
      const error = { status: 503, message: 'Service Unavailable' };
      const options: RetryOptions = {
        enabled: false
      };

      // Act & Assert: Desactivado en las opciones
      expect(httpClient.testShouldRetry(error, 0, options)).toBe(false);

      // Activado en las opciones con maxRetries personalizado
      expect(httpClient.testShouldRetry(error, 4, { enabled: true, maxRetries: 5 })).toBe(true);
      expect(httpClient.testShouldRetry(error, 5, { enabled: true, maxRetries: 5 })).toBe(false);
    });
  });
});
