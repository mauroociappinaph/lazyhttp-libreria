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
});
