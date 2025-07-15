import * as Http from '../../http';
import * as HttpServer from '../../http/server';
import * as HttpClient from '../../http/client';
import * as HttpTypes from '../../http/types';

describe('Backwards compatibility: API pública', () => {
  it('debe exponer la clase HttpError y subclases', () => {
    expect(typeof Http.HttpErrors.HttpError).toBe('function');
    expect(typeof Http.HttpErrors.HttpTimeoutError).toBe('function');
    expect(typeof Http.HttpErrors.HttpNetworkError).toBe('function');
    expect(typeof Http.HttpErrors.HttpAxiosError).toBe('function');
    expect(typeof Http.HttpErrors.HttpUnknownError).toBe('function');
    expect(typeof Http.HttpErrors.HttpAbortedError).toBe('function');
    expect(typeof Http.HttpErrors.HttpAuthError).toBe('function');
  });

  it('debe exponer el cliente http principal en server y client', () => {
    expect(HttpServer.http).toBeDefined();
    expect(HttpClient.http).toBeDefined();
  });

  it('debe exponer tipos clave de la API pública', () => {
    // Usamos los tipos en variables dummy para evitar warnings de TypeScript
    const _dummyApiResponse: HttpTypes.ApiResponse<unknown> | undefined = undefined;
    const _dummyRequestOptions: HttpTypes.RequestOptions | undefined = undefined;
    const _dummyHttpErrorHandler: HttpTypes.HttpErrorHandler | undefined = undefined;
    expect(_dummyApiResponse).toBeUndefined();
    expect(_dummyRequestOptions).toBeUndefined();
    expect(_dummyHttpErrorHandler).toBeUndefined();
  });
});
