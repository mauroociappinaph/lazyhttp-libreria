import { CookieManager } from '../../http/cookie-manager';

describe('CookieManager', () => {
  beforeEach(() => {
    // Limpiar todas las cookies antes de cada test
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
    });
  });

  it('debe crear y leer una cookie', () => {
    CookieManager.set('test', 'valor');
    expect(CookieManager.get('test')).toBe('valor');
  });

  it('debe actualizar una cookie', () => {
    CookieManager.set('test', 'uno');
    CookieManager.set('test', 'dos');
    expect(CookieManager.get('test')).toBe('dos');
  });

  it('debe eliminar una cookie', () => {
    CookieManager.set('test', 'valor');
    CookieManager.remove('test');
    expect(CookieManager.get('test')).toBeNull();
  });

  it('debe detectar existencia de cookie', () => {
    CookieManager.set('existe', 'si');
    expect(CookieManager.exists('existe')).toBe(true);
    CookieManager.remove('existe');
    expect(CookieManager.exists('existe')).toBe(false);
  });

  it('debe manejar cookies expiradas', () => {
    CookieManager.set('expira', 'valor', { expires: new Date(Date.now() - 1000) });
    expect(CookieManager.get('expira')).toBeNull();
  });

  it('debe establecer atributos especiales (secure, path, domain, sameSite)', () => {
    CookieManager.set('especial', 'valor', {
      secure: true,
      path: '/test',
      domain: window.location.hostname,
      sameSite: 'Strict',
      maxAge: 60
    });
    // Solo comprobamos que la cookie se setea correctamente
    expect(document.cookie).toContain('especial=valor');
  });
});
