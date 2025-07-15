import { ApiResponse } from '../../http/client';
import { HttpCacheManager } from '../../http/client/managers';


describe('HttpCacheManager', () => {
  let httpCacheManager: HttpCacheManager;

  beforeEach(() => {
    httpCacheManager = new HttpCacheManager();
    httpCacheManager.configure({ enabled: true, maxSize: 5, defaultTTL: 100 });
    httpCacheManager.clear();
  });

  describe('set y get', () => {
    it('almacena y recupera un valor', () => {
      const key = 'GET:/test';
      const value: ApiResponse<string> = { data: 'valor', error: null, status: 200 };
      httpCacheManager.set(key, value);
      expect(httpCacheManager.get<string>(key)).toEqual(value);
    });

    it('devuelve undefined si la clave no existe', () => {
      expect(httpCacheManager.get('no-existe')).toBeUndefined();
    });
  });

  describe('invalidate e invalidateByTags', () => {
    it('elimina entradas por patrón', () => {
      httpCacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      httpCacheManager.set('GET:/b', { data: 2, error: null, status: 200 });
      httpCacheManager.invalidate('GET:/a');
      expect(httpCacheManager.get('GET:/a')).toBeUndefined();
      expect(httpCacheManager.get('GET:/b')).toBeDefined();
    });

    it('elimina entradas por tags', () => {
      httpCacheManager.set('GET:/tag', { data: 1, error: null, status: 200 }, { tags: ['x'] });
      httpCacheManager.set('GET:/no-tag', { data: 2, error: null, status: 200 }, { tags: ['y'] });
      httpCacheManager.invalidateByTags(['x']);
      expect(httpCacheManager.get('GET:/tag')).toBeUndefined();
      expect(httpCacheManager.get('GET:/no-tag')).toBeDefined();
    });
  });

  describe('shouldUseCache', () => {
    it('solo cachea GET por defecto', () => {
      expect(httpCacheManager.shouldUseCache('GET')).toBe(true);
      expect(httpCacheManager.shouldUseCache('POST')).toBe(false);
    });
    it('respeta la opción enabled=false en options', () => {
      expect(httpCacheManager.shouldUseCache('GET', { cache: { enabled: false } })).toBe(false);
    });
    it('no usa caché si está deshabilitada globalmente', () => {
      httpCacheManager.configure({ enabled: false });
      expect(httpCacheManager.shouldUseCache('GET')).toBe(false);
    });
  });

  describe('clear y remove', () => {
    it('clear elimina todas las entradas', () => {
      httpCacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      httpCacheManager.set('GET:/b', { data: 2, error: null, status: 200 });
      httpCacheManager.clear();
      expect(httpCacheManager.get('GET:/a')).toBeUndefined();
      expect(httpCacheManager.get('GET:/b')).toBeUndefined();
    });
    it('remove elimina una entrada específica', () => {
      httpCacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      httpCacheManager.remove('GET:/a');
      expect(httpCacheManager.get('GET:/a')).toBeUndefined();
    });
  });

  describe('expiración de caché (TTL)', () => {
    it('elimina entradas expiradas', (done) => {
      httpCacheManager.set('GET:/ttl', { data: 1, error: null, status: 200 }, { ttl: 50 });
      setTimeout(() => {
        expect(httpCacheManager.get('GET:/ttl')).toBeUndefined();
        done();
      }, 60);
    });
  });

  describe('evicción por tamaño máximo', () => {
    it('elimina las entradas más antiguas al superar maxSize', () => {
      httpCacheManager.configure({ maxSize: 3 });
      httpCacheManager.clear();
      httpCacheManager.set('k1', { data: 1, error: null, status: 200 });
      httpCacheManager.set('k2', { data: 2, error: null, status: 200 });
      httpCacheManager.set('k3', { data: 3, error: null, status: 200 });
      httpCacheManager.set('k4', { data: 4, error: null, status: 200 }); // Debe evictar una
      const keys = ['k1', 'k2', 'k3', 'k4'].filter(k => httpCacheManager.get(k));
      expect(keys.length).toBe(3);
    });
  });
});
