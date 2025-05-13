import * as ClientExports from '../../../http/client';

describe('HTTP Client Exports', () => {
  test('debería exportar la instancia http principal', () => {
    // Verificar que el cliente principal está exportado
    expect(ClientExports.http).toBeDefined();
    expect(typeof ClientExports.http.get).toBe('function');
    expect(typeof ClientExports.http.post).toBe('function');
  });

  test('debería exportar métodos HTTP individuales', () => {
    // Verificar que los métodos HTTP están exportados como funciones independientes
    expect(typeof ClientExports.get).toBe('function');
    expect(typeof ClientExports.post).toBe('function');
    expect(typeof ClientExports.put).toBe('function');
    expect(typeof ClientExports.patch).toBe('function');
    expect(typeof ClientExports.del).toBe('function'); // delete es una palabra reservada
  });

  test('debería exportar métodos de autenticación', () => {
    // Verificar exportaciones relacionadas con autenticación
    expect(typeof ClientExports.configureAuth).toBe('function');
    expect(typeof ClientExports.login).toBe('function');
    expect(typeof ClientExports.logout).toBe('function');
    expect(typeof ClientExports.isAuthenticated).toBe('function');
    expect(typeof ClientExports.getAuthenticatedUser).toBe('function');
    expect(typeof ClientExports.getAccessToken).toBe('function');
  });

  test('debería exportar métodos de configuración', () => {
    // Verificar exportaciones relacionadas con configuración
    expect(typeof ClientExports.initialize).toBe('function');
    expect(typeof ClientExports.configureCaching).toBe('function');
    expect(typeof ClientExports.configureMetrics).toBe('function');
    expect(typeof ClientExports.invalidateCache).toBe('function');
  });

  test('debería exportar métodos de streaming', () => {
    // Verificar exportaciones relacionadas con streaming
    expect(typeof ClientExports.stream).toBe('function');
  });
});
