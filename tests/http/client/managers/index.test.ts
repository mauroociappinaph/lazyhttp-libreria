/**
 * Test para verificar que los managers del cliente HTTP se exportan correctamente
 */
import * as managers from '../../../../http/client/managers';

describe('HTTP Client Managers Exports', () => {
  test('debería exportar HttpAuthManager', () => {
    expect(managers).toHaveProperty('HttpAuthManager');
  });

  test('debería exportar HttpConfigManager', () => {
    expect(managers).toHaveProperty('HttpConfigManager');
  });

  test('debería exportar HttpPropertyManager', () => {
    expect(managers).toHaveProperty('HttpPropertyManager');
  });
});
