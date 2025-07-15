import { CookieManager, CookieOptions } from '../../http/http-cookies';

describe('CookieManager', () => {
  // Simular document.cookie en un entorno de Node.js
  let cookieStore: Record<string, string> = {};

  beforeAll(() => {
    // Asegurarse de que global.document exista
    if (typeof global.document === 'undefined') {
      (global as any).document = {};
    }

    Object.defineProperty(global.document, 'cookie', {
      get() {
        return Object.entries(cookieStore)
          .map(([key, value]) => `${key}=${value}`)
          .join('; ');
      },
      set(cookieString: string) {
        const [name, value] = cookieString.split('=');
        const [decodedName] = name.split(';');
        if (cookieString.includes('Max-Age=0') || cookieString.includes('Expires=Thu, 01 Jan 1970')) {
          delete cookieStore[decodedName];
        } else {
          cookieStore[decodedName] = value.split(';')[0];
        }
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    // Limpiar las cookies antes de cada prueba
    cookieStore = {};
  });

  describe('set', () => {
    it('debería establecer una cookie básica', () => {
      CookieManager.set('test', 'value');
      expect(document.cookie).toBe('test=value');
    });

    it('debería establecer una cookie con todas las opciones', () => {
      const expires = new Date(Date.now() + 86400 * 1000);
      const options: CookieOptions = {
        maxAge: 86400,
        expires,
        domain: 'example.com',
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Strict',
      };

      // La simulación de set es simplificada, solo verificamos que no lance errores
      expect(() => CookieManager.set('full', 'options', options)).not.toThrow();
    });
  });

  describe('get', () => {
    it('debería obtener una cookie existente', () => {
      CookieManager.set('test', 'value');
      expect(CookieManager.get('test')).toBe('value');
    });

    it('debería devolver null para una cookie que no existe', () => {
      expect(CookieManager.get('nonexistent')).toBeNull();
    });
  });

  describe('remove', () => {
    it('debería eliminar una cookie', () => {
      CookieManager.set('test', 'value');
      expect(CookieManager.get('test')).toBe('value');
      CookieManager.remove('test');
      expect(CookieManager.get('test')).toBeNull();
    });
  });

  describe('exists', () => {
    it('debería devolver true si la cookie existe', () => {
      CookieManager.set('test', 'value');
      expect(CookieManager.exists('test')).toBe(true);
    });

    it('debería devolver false si la cookie no existe', () => {
      expect(CookieManager.exists('nonexistent')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('debería devolver todas las cookies como un objeto', () => {
      CookieManager.set('test1', 'value1');
      CookieManager.set('test2', 'value2');
      const allCookies = CookieManager.getAll();
      expect(allCookies).toEqual({ test1: 'value1', test2: 'value2' });
    });

    it('debería devolver un objeto vacío si no hay cookies', () => {
      expect(CookieManager.getAll()).toEqual({});
    });
  });
});
