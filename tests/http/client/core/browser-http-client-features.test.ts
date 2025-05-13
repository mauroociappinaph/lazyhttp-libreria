import { BrowserHttpClient } from '../../../../http/client/core/browser-http-client';
import axios from 'axios';
import { interceptorsManager } from '../../../../http/http-interceptors-manager';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock de interceptorsManager
jest.mock('../../../../http/http-interceptors-manager', () => ({
  interceptorsManager: {
    setupInterceptors: jest.fn(),
    getRequestInterceptors: jest.fn().mockReturnValue([]),
    getResponseInterceptors: jest.fn().mockReturnValue([])
  }
}));

// Crear un mock para localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {};

  return {
    getItem: function(key: string) {
      return store[key] || null;
    },
    setItem: function(key: string, value: string) {
      store[key] = value;
    },
    removeItem: function(key: string) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

// Reemplazar el localStorage del navegador con nuestro mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('BrowserHttpClient - Características Avanzadas', () => {
  let httpClient: BrowserHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();

    httpClient = new BrowserHttpClient();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Retry System', () => {
    test('debería reintentar automáticamente una petición fallida con configuración global', async () => {
      // Arrange
      // Configurar retry global
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        retry: {
          enabled: true,
          maxRetries: 2,
          initialDelay: 100,
          backoffFactor: 2,
          retryableStatusCodes: [500, 503]
        }
      });

      // Simular error seguido de éxito
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

      // Act - Iniciar solicitud
      const requestPromise = httpClient.get('/test');

      // Avanzar el tiempo para que se ejecuten los reintentos
      jest.runAllTimers();

      // Resolver la promesa
      const response = await requestPromise;

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
      expect(response.data).toEqual({ success: true });
      expect(response.status).toBe(200);
    });

    test('debería reintentar con opciones específicas de la petición que sobrescriben la configuración global', async () => {
      // Arrange
      // Configurar retry global (desactivado)
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        retry: {
          enabled: false,
          maxRetries: 1,
          initialDelay: 100
        }
      });

      // Simular error seguido de éxito
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

      // Act - Iniciar solicitud con retry activado específicamente para esta petición
      const requestPromise = httpClient.get('/test', {
        retryOptions: {
          enabled: true,
          maxRetries: 1,
          initialDelay: 50
        }
      });

      // Avanzar el tiempo para que se ejecuten los reintentos
      jest.runAllTimers();

      // Resolver la promesa
      const response = await requestPromise;

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
      expect(response.data).toEqual({ success: true });
    });

    test('no debería reintentar si retry está desactivado aunque el error sea reintentable', async () => {
      // Arrange
      // Configurar cliente sin retry
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        retry: {
          enabled: false
        }
      });

      // Simular error
      mockedAxios.request.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledTimes(1);
    });

    test('debería reintentar solo errores específicos configurados', async () => {
      // Arrange
      // Configurar cliente con tipos específicos de error
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        retry: {
          enabled: true,
          maxRetries: 2,
          retryableStatusCodes: [503], // Solo 503, no 500
          retryableErrors: ['ETIMEDOUT']
        }
      });

      // Simular error no reintentable (código 500)
      mockedAxios.request.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Server Error' } },
        isAxiosError: true
      });

      // Act
      await httpClient.get('/test');

      // Assert - No debería haber reintento
      expect(mockedAxios.request).toHaveBeenCalledTimes(1);

      // Ahora simular error reintentable (código 503)
      jest.clearAllMocks();
      mockedAxios.request
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

      // Act nuevamente
      const requestPromise = httpClient.get('/test');
      jest.runAllTimers();
      await requestPromise;

      // Assert - Debería haber reintento
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
    });

    test('debería reintentar errores de red específicos configurados', async () => {
      // Arrange
      // Configurar cliente con tipos específicos de error de red
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        retry: {
          enabled: true,
          maxRetries: 2,
          retryableErrors: ['ECONNRESET', 'ETIMEDOUT']
        }
      });

      // Simular error reintentable de conexión
      mockedAxios.request
        .mockRejectedValueOnce({
          code: 'ECONNRESET',
          message: 'Connection Reset',
          isAxiosError: true
        })
        .mockResolvedValueOnce({
          data: { success: true },
          status: 200,
          headers: {},
          config: {}
        });

      // Act
      const requestPromise = httpClient.get('/test');
      jest.runAllTimers();
      await requestPromise;

      // Assert - Debería haber reintento
      expect(mockedAxios.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('Configuración Personalizada', () => {
    test('debería aplicar headers personalizados globales', async () => {
      // Arrange
      const customHeaders = { 'X-Api-Key': 'test-key', 'Custom-Header': 'value' };

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        headers: customHeaders
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders)
        })
      );
    });

    test('debería fusionar headers personalizados con los headers por petición', async () => {
      // Arrange
      const globalHeaders = { 'X-Api-Key': 'global-key', 'Global-Header': 'global' };
      const requestHeaders = { 'X-Api-Key': 'request-key', 'Request-Header': 'request' };

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        headers: globalHeaders
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { headers: requestHeaders });

      // Assert - Los headers de la petición deben sobrescribir los globales
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Api-Key': 'request-key', // Sobrescrito
            'Global-Header': 'global',   // Mantenido
            'Request-Header': 'request'  // Añadido
          })
        })
      );
    });

    test('debería aplicar timeout global personalizado', async () => {
      // Arrange
      const customTimeout = 5000; // 5 segundos

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        timeout: customTimeout
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeout
        })
      );
    });

    test('debería usar el timeout específico de la petición sobre el global', async () => {
      // Arrange
      const globalTimeout = 5000; // 5 segundos
      const requestTimeout = 2000; // 2 segundos

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        timeout: globalTimeout
      });

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { timeout: requestTimeout });

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: requestTimeout
        })
      );
    });

    test('debería incluir token de autenticación cuando withAuth es true', async () => {
      // Arrange
      const authToken = 'test-auth-token';

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        auth: {
          tokenKey: 'auth_token'
        }
      });

      // Simular token en localStorage
      localStorage.setItem('auth_token', authToken);

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { withAuth: true });

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${authToken}`
          })
        })
      );
    });
  });

  describe('Interceptors', () => {
    test('debería aplicar interceptores de petición', async () => {
      // Arrange
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com'
      });

      // Mock de interceptor que añade un header
      const requestInterceptor = (config: any) => {
        config.headers['X-Interceptor'] = 'applied';
        return config;
      };

      // Configurar mock de interceptorsManager para devolver nuestro interceptor
      (interceptorsManager.getRequestInterceptors as jest.Mock).mockReturnValue([requestInterceptor]);

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(interceptorsManager.getRequestInterceptors).toHaveBeenCalled();
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Interceptor': 'applied'
          })
        })
      );
    });

    test('debería aplicar interceptores de respuesta', async () => {
      // Arrange
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com'
      });

      // Mock de interceptor que modifica la respuesta
      const responseInterceptor = (response: any) => {
        response.intercepted = true;
        return response;
      };

      // Configurar mock de interceptorsManager para devolver nuestro interceptor
      (interceptorsManager.getResponseInterceptors as jest.Mock).mockReturnValue([responseInterceptor]);

      mockedAxios.request.mockResolvedValueOnce({
        data: { original: true },
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      const response = await httpClient.get('/test');

      // Assert
      expect(interceptorsManager.getResponseInterceptors).toHaveBeenCalled();
      expect(response).toHaveProperty('intercepted', true);
    });

    test('debería permitir modificar datos de petición con interceptores', async () => {
      // Arrange
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com'
      });

      // Datos originales a enviar
      const originalData = { name: 'test' };

      // Mock de interceptor que modifica los datos
      const requestInterceptor = (config: any) => {
        if (config.data) {
          config.data = {
            ...config.data,
            intercepted: true,
            timestamp: '2023-08-15'
          };
        }
        return config;
      };

      // Configurar mock para devolver nuestro interceptor
      (interceptorsManager.getRequestInterceptors as jest.Mock).mockReturnValue([requestInterceptor]);

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.post('/test', originalData);

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'test',
            intercepted: true,
            timestamp: '2023-08-15'
          })
        })
      );
    });

    test('debería permitir encadenar múltiples interceptores', async () => {
      // Arrange
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com'
      });

      // Mock de interceptores en cadena
      const firstInterceptor = (config: any) => {
        config.headers['X-First'] = 'first';
        return config;
      };

      const secondInterceptor = (config: any) => {
        config.headers['X-Second'] = 'second';
        return config;
      };

      // Configurar mock para devolver nuestros interceptores
      (interceptorsManager.getRequestInterceptors as jest.Mock).mockReturnValue([
        firstInterceptor,
        secondInterceptor
      ]);

      mockedAxios.request.mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(mockedAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-First': 'first',
            'X-Second': 'second'
          })
        })
      );
    });
  });
});
