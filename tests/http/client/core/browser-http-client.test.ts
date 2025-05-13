import { BrowserHttpClient } from '../../../../http/client/core/browser-http-client';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BrowserHttpClient - Retry', () => {
  let httpClient: BrowserHttpClient;

  beforeEach(() => {
    // Limpia mocks entre tests
    jest.clearAllMocks();

    // Crear instancia con configuración de retry
    httpClient = new BrowserHttpClient();
    httpClient.initialize({
      baseUrl: 'https://api.ejemplo.com',
      retry: {
        enabled: true,
        maxRetries: 2,
        initialDelay: 100,
        backoffFactor: 2,
        retryableStatusCodes: [500, 503],
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
      }
    });
  });

  test('debería reintentar automáticamente cuando ocurre un error reintentable', async () => {
    // Arrange
    // Simular 2 errores y luego éxito
    mockedAxios.request
      .mockRejectedValueOnce({
        response: { status: 503, data: { message: 'Service Unavailable' } },
        isAxiosError: true
      })
      .mockRejectedValueOnce({
        response: { status: 503, data: { message: 'Service Unavailable' } },
        isAxiosError: true
      })
      .mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: {},
        config: {}
      });

    // La función setTimeout debe ser simulada para que los reintentos sean instantáneos
    jest.useFakeTimers();

    // Act
    const requestPromise = httpClient.get('/test');

    // Avanzamos los temporizadores para que se ejecuten los reintentos
    jest.runAllTimers();

    const response = await requestPromise;

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledTimes(3); // Intento original + 2 reintentos
    expect(response.data).toEqual({ success: true });
    expect(response.status).toBe(200);

    // Restauramos
    jest.useRealTimers();
  });

  test('debería no reintentar si el error no es reintentable', async () => {
    // Arrange
    mockedAxios.request.mockRejectedValueOnce({
      response: { status: 404, data: { message: 'Not Found' } },
      isAxiosError: true
    });

    // Act
    const response = await httpClient.get('/test');

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledTimes(1); // Solo el intento original
    expect(response.status).toBe(404);
    expect(response.error).toBeDefined();
  });

  test('debería no exceder el número máximo de reintentos', async () => {
    // Arrange
    // Simular 3 errores consecutivos (excediendo maxRetries: 2)
    mockedAxios.request
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      })
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      })
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      });

    jest.useFakeTimers();

    // Act
    const requestPromise = httpClient.get('/test');
    jest.runAllTimers();
    const response = await requestPromise;

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledTimes(3); // Intento original + 2 reintentos
    expect(response.status).toBe(500);
    expect(response.error).toBeDefined();

    jest.useRealTimers();
  });

  test('debería respetar las opciones de retry específicas de la petición', async () => {
    // Arrange
    mockedAxios.request
      .mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      })
      .mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: {},
        config: {}
      });

    jest.useFakeTimers();

    // Act
    // Usar opciones específicas de la petición (maxRetries: 1)
    const requestPromise = httpClient.get('/test', {
      retryOptions: {
        maxRetries: 1, // Sobrescribe el valor global (2)
      }
    });

    jest.runAllTimers();
    const response = await requestPromise;

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledTimes(2); // Intento original + 1 reintento
    expect(response.data).toEqual({ success: true });

    jest.useRealTimers();
  });

  test('debería reintentar errores de red específicos', async () => {
    // Arrange
    mockedAxios.request
      .mockRejectedValueOnce({
        code: 'ECONNRESET',
        message: 'Connection reset',
        isAxiosError: true
      })
      .mockResolvedValueOnce({
        data: { success: true },
        status: 200,
        headers: {},
        config: {}
      });

    jest.useFakeTimers();

    // Act
    const requestPromise = httpClient.get('/test');
    jest.runAllTimers();
    const response = await requestPromise;

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledTimes(2); // Intento original + 1 reintento
    expect(response.data).toEqual({ success: true });

    jest.useRealTimers();
  });
});
