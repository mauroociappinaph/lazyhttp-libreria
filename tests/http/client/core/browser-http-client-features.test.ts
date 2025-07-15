import { BrowserHttpClient } from '../../../../http/client/core/browser-http-client';
import axios from 'axios';
import { RequestOptions, InitConfig } from '../../../../http/types/core.types';



// Mock solo del método request de axios
jest.spyOn(axios, 'request');

// Mock de interceptorsManager
jest.mock('../../../../http/interceptors/http-interceptors-manager', () => ({
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
    },
    // Añadir propiedades faltantes para cumplir con Storage
    length: 0,
    key: function(index: number): string | null {
      return Object.keys(store)[index] || null;
    }
  } as Storage;
})();

// Simular window global para entorno Node
if (typeof global.window === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  global.window = {} as any;
}

// Crear global.localStorage
global.localStorage = localStorageMock;

// Reemplazar el localStorage del navegador con nuestro mock
Object.defineProperty(global.window, 'localStorage', {
  value: localStorageMock
});

describe('BrowserHttpClient - Características Avanzadas', () => {
  let httpClient: BrowserHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    global.localStorage.clear();
    httpClient = new BrowserHttpClient({});
  });

  describe('Configuración Personalizada', () => {
    test('debería aplicar headers personalizados globales', async () => {
      // Arrange
      const customHeaders = { 'X-Api-Key': 'test-key', 'Custom-Header': 'value' };

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        headers: customHeaders
      } as Partial<InitConfig>);

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(axios.request).toHaveBeenCalledWith(
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
      } as Partial<InitConfig>);

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { headers: requestHeaders });

      // Assert - Los headers de la petición deben sobrescribir los globales
      expect(axios.request).toHaveBeenCalledWith(
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
      } as Partial<InitConfig>);

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test');

      // Assert
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: customTimeout
        })
      );
    });

    test('debería usar el timeout específico de la petición sobre el global', async () => {
      // Arrange
      const globalTimeout = 5000;
      const requestTimeout = 2000;

      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        timeout: globalTimeout
      } as Partial<InitConfig>);

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { timeout: requestTimeout });

      // Assert
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: requestTimeout
        })
      );
    });

    test('debería incluir token de autenticación cuando withAuth es true', async () => {
      // Arrange
      const authToken = 'test-auth-token';

      // Simular token en localStorage ANTES de crear el cliente
      global.localStorage.setItem('auth_token', authToken);

      httpClient = new BrowserHttpClient({
        baseUrl: 'https://api.ejemplo.com',
        auth: {
          tokenKey: 'auth_token'
        }
      } as Partial<InitConfig>);
      httpClient.initialize({
        baseUrl: 'https://api.ejemplo.com',
        auth: {
          tokenKey: 'auth_token'
        }
      } as Partial<InitConfig>);

      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: {},
        status: 200,
        headers: {},
        config: {}
      });

      // Act
      await httpClient.get('/test', { withAuth: true });

      // Assert
      expect(axios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${authToken}`
          })
        })
      );
    });
  });

  // Nota: Los tests de Retry se han desactivado temporalmente
  // debido a problemas con los temporizadores simulados

  // Nota: Los tests de Interceptors se han desactivado temporalmente

  describe('Transformadores automáticos (request/response)', () => {
    let httpClient: BrowserHttpClient;

    beforeEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
      jest.spyOn(axios, 'request');
      httpClient = new BrowserHttpClient({});
      httpClient.initialize({ baseUrl: 'https://api.ejemplo.com' } as Partial<InitConfig>);
    });

    test('aplica transformRequest global antes de enviar la data', async () => {
      const transformFn = jest.fn((data) => ({ ...data, extra: true }));
      httpClient.initialize({ transformRequest: transformFn } as Partial<InitConfig>);
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: { ok: true }, status: 200, headers: {}, config: {}
      });
      await httpClient.post('/test', { foo: 'bar' });
      expect(transformFn).toHaveBeenCalledWith({ foo: 'bar' });
      expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
        data: { foo: 'bar', extra: true }
      }));
    });

    test('aplica transformResponse global después de recibir la data', async () => {
      const transformFn = jest.fn((data) => ({ ...data, transformed: true }));
      httpClient.initialize({ transformResponse: transformFn } as Partial<InitConfig>);
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: { ok: true }, status: 200, headers: {}, config: {}
      });
      const resp = await httpClient.get('/test');
      expect(transformFn).toHaveBeenCalledWith({ ok: true });
      expect(resp.data).toEqual({ ok: true, transformed: true });
    });

    test('aplica transformadores por petición y sobreescribe los globales', async () => {
      const globalTransform = jest.fn((data) => ({ ...data, global: true }));
      const perRequestTransform = jest.fn((data) => ({ ...data, perRequest: true }));
      httpClient.initialize({ transformRequest: globalTransform } as Partial<InitConfig>);
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: { ok: true }, status: 200, headers: {}, config: {}
      });
      await httpClient.post('/test', { foo: 1 }, { transformRequest: perRequestTransform } as RequestOptions);
      expect(globalTransform).not.toHaveBeenCalled();
      expect(perRequestTransform).toHaveBeenCalledWith({ foo: 1 });
      expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
        data: { foo: 1, perRequest: true }
      }));
    });

    test('aplica múltiples transformadores en orden', async () => {
      const t1 = jest.fn((data) => ({ ...data, t1: true }));
      const t2 = jest.fn((data) => ({ ...data, t2: true }));
      httpClient.initialize({ transformRequest: [t1, t2] } as Partial<InitConfig>);
      (axios.request as jest.Mock).mockResolvedValueOnce({
        data: { ok: true }, status: 200, headers: {}, config: {}
      });
      await httpClient.post('/test', { foo: 1 });
      expect(t1).toHaveBeenCalledWith({ foo: 1 });
      expect(t2).toHaveBeenCalledWith({ foo: 1, t1: true });
      expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
        data: { foo: 1, t1: true, t2: true }
      }));
    });
  });
});
