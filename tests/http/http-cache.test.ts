import { cacheManager } from '../../http/http-cache';
import { ApiResponse } from '../../http/types/core.types';

describe('cacheManager', () => {
  beforeEach(() => {
    cacheManager.configure({ enabled: true, maxSize: 5, defaultTTL: 100 });
    cacheManager.clear();
  });

  describe('set y get', () => {
    it('almacena y recupera un valor', () => {
      const key = 'GET:/test';
      const value: ApiResponse<string> = { data: 'valor', error: null, status: 200 };
      cacheManager.set(key, value);
      expect(cacheManager.get<string>(key)).toEqual(value);
    });

    it('devuelve undefined si la clave no existe', () => {
      expect(cacheManager.get('no-existe')).toBeUndefined();
    });
  });

  describe('invalidate e invalidateByTags', () => {
    it('elimina entradas por patrón', () => {
      cacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      cacheManager.set('GET:/b', { data: 2, error: null, status: 200 });
      cacheManager.invalidate('GET:/a');
      expect(cacheManager.get('GET:/a')).toBeUndefined();
      expect(cacheManager.get('GET:/b')).toBeDefined();
    });

    it('elimina entradas por tags', () => {
      cacheManager.set('GET:/tag', { data: 1, error: null, status: 200 }, { tags: ['x'] });
      cacheManager.set('GET:/no-tag', { data: 2, error: null, status: 200 }, { tags: ['y'] });
      cacheManager.invalidateByTags(['x']);
      expect(cacheManager.get('GET:/tag')).toBeUndefined();
      expect(cacheManager.get('GET:/no-tag')).toBeDefined();
    });
  });

  describe('shouldUseCache', () => {
    it('solo cachea GET por defecto', () => {
      expect(cacheManager.shouldUseCache('GET')).toBe(true);
      expect(cacheManager.shouldUseCache('POST')).toBe(false);
    });
    it('respeta la opción enabled=false en options', () => {
      expect(cacheManager.shouldUseCache('GET', { cache: { enabled: false } })).toBe(false);
    });
    it('no usa caché si está deshabilitada globalmente', () => {
      cacheManager.configure({ enabled: false });
      expect(cacheManager.shouldUseCache('GET')).toBe(false);
    });
  });

  describe('clear y remove', () => {
    it('clear elimina todas las entradas', () => {
      cacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      cacheManager.set('GET:/b', { data: 2, error: null, status: 200 });
      cacheManager.clear();
      expect(cacheManager.get('GET:/a')).toBeUndefined();
      expect(cacheManager.get('GET:/b')).toBeUndefined();
    });
    it('remove elimina una entrada específica', () => {
      cacheManager.set('GET:/a', { data: 1, error: null, status: 200 });
      cacheManager.delete('GET:/a');
      expect(cacheManager.get('GET:/a')).toBeUndefined();
    });
  });

  describe('expiración de caché (TTL)', () => {
    it('elimina entradas expiradas', (done) => {
      cacheManager.set('GET:/ttl', { data: 1, error: null, status: 200 }, { ttl: 50 });
      setTimeout(() => {
        expect(cacheManager.get('GET:/ttl')).toBeUndefined();
        done();
      }, 60);
    });
  });

  describe('evicción por tamaño máximo', () => {
    it('elimina las entradas más antiguas al superar maxSize', () => {
      cacheManager.configure({ maxSize: 3 });
      cacheManager.clear();
      cacheManager.set('k1', { data: 1, error: null, status: 200 });
      cacheManager.set('k2', { data: 2, error: null, status: 200 });
      cacheManager.set('k3', { data: 3, error: null, status: 200 });
      cacheManager.set('k4', { data: 4, error: null, status: 200 }); // Debe evictar una
      const keys = ['k1', 'k2', 'k3', 'k4'].filter(k => cacheManager.get(k));
      expect(keys.length).toBe(3);
    });
  });
});
