import { InterceptorsManager } from '../../../http/interceptors/http-interceptors-manager';

describe('InterceptorsManager', () => {
  let interceptorsManager: InterceptorsManager;

  beforeEach(() => {
    interceptorsManager = new InterceptorsManager();
  });

  it('debería inicializar sin interceptores', () => {
    expect(interceptorsManager.getRequestInterceptors()).toEqual([]);
    expect(interceptorsManager.getResponseInterceptors()).toEqual([]);
  });

  it('debería añadir un interceptor de petición', () => {
    const requestInterceptor = (config: any) => config;
    interceptorsManager.setupInterceptors(requestInterceptor, 'request');
    expect(interceptorsManager.getRequestInterceptors()).toContain(requestInterceptor);
  });

  it('debería añadir un interceptor de respuesta', () => {
    const responseInterceptor = (response: any) => response;
    interceptorsManager.setupInterceptors(responseInterceptor, 'response');
    expect(interceptorsManager.getResponseInterceptors()).toContain(responseInterceptor);
  });

  it('debería limpiar todos los interceptores', () => {
    const requestInterceptor = (config: any) => config;
    const responseInterceptor = (response: any) => response;
    interceptorsManager.setupInterceptors(requestInterceptor, 'request');
    interceptorsManager.setupInterceptors(responseInterceptor, 'response');

    interceptorsManager.setupInterceptors(); // Llamar sin argumentos para limpiar

    expect(interceptorsManager.getRequestInterceptors()).toEqual([]);
    expect(interceptorsManager.getResponseInterceptors()).toEqual([]);
  });

  it('debería ejecutar los interceptores de petición en el orden correcto', () => {
    const orden: string[] = [];
    const interceptor1 = (config: any) => {
      orden.push('primero');
      config.valor = (config.valor || 0) + 1;
      return config;
    };
    const interceptor2 = (config: any) => {
      orden.push('segundo');
      config.valor = (config.valor || 0) * 10;
      return config;
    };
    interceptorsManager.setupInterceptors(interceptor1, 'request');
    interceptorsManager.setupInterceptors(interceptor2, 'request');

    // Simular la aplicación en cadena
    const interceptores = interceptorsManager.getRequestInterceptors();
    let config = { valor: 2 };
    for (const interceptor of interceptores) {
      config = interceptor(config);
    }

    expect(orden).toEqual(['primero', 'segundo']);
    expect(config.valor).toBe(30); // (2+1)*10
  });

  it('debería ejecutar los interceptores de respuesta en el orden correcto', () => {
    const orden: string[] = [];
    const interceptor1 = (response: any) => {
      orden.push('primero');
      response.valor = (response.valor || 0) + 1;
      return response;
    };
    const interceptor2 = (response: any) => {
      orden.push('segundo');
      response.valor = (response.valor || 0) * 10;
      return response;
    };
    interceptorsManager.setupInterceptors(interceptor1, 'response');
    interceptorsManager.setupInterceptors(interceptor2, 'response');

    // Simular la aplicación en cadena
    const interceptores = interceptorsManager.getResponseInterceptors();
    let response = { valor: 2 };
    for (const interceptor of interceptores) {
      response = interceptor(response);
    }

    expect(orden).toEqual(['primero', 'segundo']);
    expect(response.valor).toBe(30); // (2+1)*10
  });
});
