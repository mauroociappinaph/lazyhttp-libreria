import { http } from '../../http/client';

describe('Integración: fullMeta en ApiResponse', () => {
  it('debe poblar fullMeta con headers y timings en una petición real', async () => {
    const response = await http.get('https://jsonplaceholder.typicode.com/posts/1');
    // Mostrar la respuesta completa para depuración
    console.log('Respuesta completa:', response);
    expect(response).toHaveProperty('fullMeta');
    expect(response.fullMeta).toBeDefined();
    expect(typeof response.fullMeta?.requestHeaders).toBe('object');
    expect(typeof response.fullMeta?.responseHeaders).toBe('object');
    expect(typeof response.fullMeta?.timing).toBe('object');
    expect(typeof response.fullMeta?.timing.requestStart).toBe('number');
    expect(typeof response.fullMeta?.timing.responseEnd).toBe('number');
  });
});
