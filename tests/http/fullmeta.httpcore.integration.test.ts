import { HttpCore } from '../../http/http-core';

describe('HttpCore integración directa', () => {
  it('debe poblar fullMeta en la respuesta', async () => {
    const core = new HttpCore();
    const response = await core.get('https://jsonplaceholder.typicode.com/posts/1');
    const resp: any = response;
    console.log('Respuesta HttpCore:', resp);
    expect(resp).toHaveProperty('fullMeta');
    expect(resp.fullMeta).toBeDefined();
    expect(typeof resp.fullMeta?.requestHeaders).toBe('object');
    expect(typeof resp.fullMeta?.responseHeaders).toBe('object');
    expect(typeof resp.fullMeta?.timing).toBe('object');
    expect(typeof resp.fullMeta?.timing.requestStart).toBe('number');
    expect(typeof resp.fullMeta?.timing.responseEnd).toBe('number');
  });
});
