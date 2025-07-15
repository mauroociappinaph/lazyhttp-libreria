import { http } from '../../http/http-index';
import { API_URL, DEFAULT_TIMEOUT } from '../../http/http-config';

describe('HttpLazy Configuration', () => {
  beforeEach(() => {
    // Resetear la configuración de http antes de cada test
    http.initialize({
      baseURL: API_URL,
      timeout: DEFAULT_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });

  it('debería tener la configuración base correcta', () => {
    expect(http['_baseUrl']).toBe(API_URL);
    expect(http['_defaultTimeout']).toBe(DEFAULT_TIMEOUT);
    expect(http['_defaultHeaders']?.['Content-Type']).toBe('application/json');
  });

  it('debería permitir actualizar la configuración', () => {
    const newBaseURL = 'https://newapi.example.com';
    const newTimeout = 5000;
    http.initialize({
      baseURL: newBaseURL,
      timeout: newTimeout,
    });

    expect(http['_baseUrl']).toBe(newBaseURL);
    expect(http['_defaultTimeout']).toBe(newTimeout);
  });
});
