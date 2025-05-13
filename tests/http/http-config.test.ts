import { httpInstance, API_URL, DEFAULT_TIMEOUT } from '../../http/http-config';

// No es necesario importar axios para comprobar la instancia, ya que axios crea instancias con prototipo especial

describe('httpInstance (http-config)', () => {
  it('debería estar definida y tener propiedades de instancia de Axios', () => {
    expect(httpInstance).toBeDefined();
    // Puede ser función o tipo especial, pero debe tener interceptors y defaults
    expect(httpInstance).toHaveProperty('interceptors');
    expect(httpInstance).toHaveProperty('defaults');
    expect(typeof httpInstance.request).toBe('function');
    expect(typeof httpInstance.get).toBe('function');
    expect(typeof httpInstance.post).toBe('function');
  });

  it('debería tener la configuración base correcta', () => {
    expect(httpInstance.defaults.baseURL).toBe(API_URL);
    expect(httpInstance.defaults.timeout).toBe(DEFAULT_TIMEOUT);
    expect(httpInstance.defaults.withCredentials).toBe(true);
    expect(httpInstance.defaults.headers['Content-Type']).toBe('application/json');
  });
});
