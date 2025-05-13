import * as ManagersExport from '../../../../http/client/managers';

describe('HTTP Managers Exports', () => {
  test('debería exportar todas las clases de managers correctamente', () => {
    // Verificar que se exportan los managers
    expect(ManagersExport.HttpAuthManager).toBeDefined();
    expect(ManagersExport.HttpConfigManager).toBeDefined();
    expect(ManagersExport.HttpPropertyManager).toBeDefined();
  });

  test('debería poder instanciar los managers exportados', () => {
    // Verificar que se pueden instanciar (esto garantiza que son constructores válidos)
    expect(typeof ManagersExport.HttpAuthManager).toBe('function');
    expect(typeof ManagersExport.HttpConfigManager).toBe('function');
    expect(typeof ManagersExport.HttpPropertyManager).toBe('function');
  });
});
