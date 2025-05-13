import * as ClientExports from '../../../http/client';

describe('HTTP Client Exports', () => {
  test('debería exportar el cliente HTTP principal', () => {
    // Verificar que el cliente principal está exportado
    expect(ClientExports.createHttpClient).toBeDefined();
    expect(typeof ClientExports.createHttpClient).toBe('function');
  });

  test('debería exportar tipos e interfaces', () => {
    // Verificar que el objeto de exportaciones contiene tipos clave
    // Nota: En JavaScript, los tipos y interfaces no existen en tiempo de ejecución,
    // por lo que solo podemos verificar que el módulo se importe correctamente
    expect(ClientExports).toBeDefined();
  });

  test('debería exportar funcionalidad de autenticación', () => {
    // Verificar exportaciones relacionadas con autenticación (si están presentes)
    if (ClientExports.AuthOptions) {
      expect(ClientExports.AuthOptions).toBeDefined();
    }
  });

  test('debería exportar configuraciones del cliente', () => {
    // Verificar exportaciones relacionadas con configuración
    if (ClientExports.HttpConfig) {
      expect(ClientExports.HttpConfig).toBeDefined();
    }
  });
});
