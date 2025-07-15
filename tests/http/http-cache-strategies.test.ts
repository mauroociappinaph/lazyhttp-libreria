import {
  cacheFirst,
  networkFirst,
  staleWhileRevalidate,
  networkOnly,
  cacheOnly,
  executeWithCacheStrategy,
} from '../../http/http-cache-strategies';
import { httpCacheManager as cache } from '../../http/client/managers/http-cache-manager';
import { ApiResponse, RequestOptions } from '../../http/types';

// Mockear el módulo del gestor de caché
jest.mock('../../http/client/managers/http-cache-manager', () => ({
  httpCacheManager: {
    get: jest.fn(),
    set: jest.fn(),
    getStrategy: jest.fn(),
  },
}));

// Tipar el mock para tener autocompletado y seguridad de tipos
const mockCache = cache as jest.Mocked<typeof cache>;

describe('Estrategias de Caché', () => {
  const cacheKey = 'test-key';
  const networkResponse: ApiResponse<string> = { data: 'datos de red', error: null, status: 200 };
  const cachedResponse: ApiResponse<string> = { data: 'datos de caché', error: null, status: 200 };
  const errorResponse: ApiResponse<string> = { data: null, error: 'Error de Red', status: 500 };

  let networkFetcher: jest.Mock<Promise<ApiResponse<string>>>;

  beforeEach(() => {
    // Reiniciar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    networkFetcher = jest.fn().mockResolvedValue(networkResponse);
  });

  describe('cacheFirst', () => {
    it('debería devolver datos de la caché si están disponibles', async () => {
      mockCache.get.mockReturnValue(cachedResponse);
      const result = await cacheFirst(cacheKey, networkFetcher);
      expect(result).toEqual(cachedResponse);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(networkFetcher).not.toHaveBeenCalled();
    });

    it('debería llamar al network fetcher si la caché está vacía y cachear el resultado', async () => {
      mockCache.get.mockReturnValue(undefined);
      const result = await cacheFirst(cacheKey, networkFetcher);
      expect(result).toEqual(networkResponse);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
      expect(networkFetcher).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, networkResponse, undefined);
    });

    it('no debería cachear errores de red', async () => {
      mockCache.get.mockReturnValue(undefined);
      networkFetcher.mockResolvedValue(errorResponse);
      const result = await cacheFirst(cacheKey, networkFetcher);
      expect(result).toEqual(errorResponse);
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });

  describe('networkFirst', () => {
    it('debería devolver datos de la red y cachearlos', async () => {
      const result = await networkFirst(cacheKey, networkFetcher);
      expect(result).toEqual(networkResponse);
      expect(networkFetcher).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, networkResponse, undefined);
    });

    it('debería devolver datos de la caché si la red falla', async () => {
      networkFetcher.mockRejectedValue(new Error('Error de Red'));
      mockCache.get.mockReturnValue(cachedResponse);
      const result = await networkFirst(cacheKey, networkFetcher);
      expect(result.data).toBe('datos de caché');
      expect(result.meta?.fromCache).toBe(true);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
    });

    it('debería devolver un error si la red falla y la caché está vacía', async () => {
      networkFetcher.mockRejectedValue(new Error('Error de Red'));
      mockCache.get.mockReturnValue(undefined);
      const result = await networkFirst(cacheKey, networkFetcher);
      expect(result.error).toContain('Error obteniendo datos');
      expect(result.data).toBeNull();
    });
  });

  describe('staleWhileRevalidate', () => {
    it('debería devolver datos de caché inmediatamente y revalidar en segundo plano', async () => {
      mockCache.get.mockReturnValue(cachedResponse);
      const result = await staleWhileRevalidate(cacheKey, networkFetcher);

      expect(result.data).toBe('datos de caché');
      expect(result.meta?.fromCache).toBe(true);
      expect(result.meta?.refreshing).toBe(true);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);

      // Permitir que la promesa de la revalidación en segundo plano se complete
      await new Promise(process.nextTick);

      expect(networkFetcher).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, networkResponse, undefined);
    });

    it('debería obtener de la red si la caché está vacía', async () => {
      mockCache.get.mockReturnValue(undefined);
      const result = await staleWhileRevalidate(cacheKey, networkFetcher);
      expect(result).toEqual(networkResponse);
      expect(networkFetcher).toHaveBeenCalledTimes(1);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, networkResponse, undefined);
    });
  });

  describe('networkOnly', () => {
    it('siempre debería obtener de la red', async () => {
      const result = await networkOnly(cacheKey, networkFetcher);
      expect(result).toEqual(networkResponse);
      expect(networkFetcher).toHaveBeenCalledTimes(1);
      expect(mockCache.get).not.toHaveBeenCalled();
    });

    it('aún debería cachear la respuesta', async () => {
      await networkOnly(cacheKey, networkFetcher);
      expect(mockCache.set).toHaveBeenCalledWith(cacheKey, networkResponse, undefined);
    });
  });

  describe('cacheOnly', () => {
    it('debería devolver datos de la caché', async () => {
      mockCache.get.mockReturnValue(cachedResponse);
      const result = await cacheOnly(cacheKey);
      expect(result).toEqual(cachedResponse);
      expect(mockCache.get).toHaveBeenCalledWith(cacheKey);
    });

    it('debería devolver un error si la caché está vacía', async () => {
      mockCache.get.mockReturnValue(undefined);
      const result = await cacheOnly(cacheKey);
      expect(result.error).toBe('No hay datos en caché');
      expect(result.status).toBe(404);
    });
  });

  describe('executeWithCacheStrategy', () => {
    it('debería llamar a la estrategia cacheFirst', async () => {
      const options: RequestOptions = { cache: { strategy: 'cache-first' } };
      mockCache.getStrategy.mockReturnValue('cache-first');
      mockCache.get.mockReturnValue(cachedResponse);

      const result = await executeWithCacheStrategy(cacheKey, networkFetcher, options);

      expect(mockCache.getStrategy).toHaveBeenCalledWith(options);
      expect(result).toEqual(cachedResponse);
    });

    it('debería llamar a la estrategia networkFirst', async () => {
      const options: RequestOptions = { cache: { strategy: 'network-first' } };
      mockCache.getStrategy.mockReturnValue('network-first');

      const result = await executeWithCacheStrategy(cacheKey, networkFetcher, options);

      expect(mockCache.getStrategy).toHaveBeenCalledWith(options);
      expect(result).toEqual(networkResponse);
      expect(networkFetcher).toHaveBeenCalledTimes(1);
    });
  });
});
