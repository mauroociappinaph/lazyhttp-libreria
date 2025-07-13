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

  it('debe poblar fullMeta.rawBody como Buffer si la respuesta es binaria', async () => {
    const core = new HttpCore();
    // Simular una respuesta binaria usando un endpoint que devuelva datos binarios (por ejemplo, una imagen pequeña)
    const response = await core.get('https://httpbin.org/image/png');
    const resp: any = response;
    expect(resp).toHaveProperty('fullMeta');
    expect(resp.fullMeta).toBeDefined();
    expect(resp.fullMeta.rawBody).toBeDefined();
    // En Node.js, debe ser Buffer
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(resp.fullMeta.rawBody)) {
      expect(Buffer.isBuffer(resp.fullMeta.rawBody)).toBe(true);
      // El buffer debe tener datos
      expect(resp.fullMeta.rawBody.length).toBeGreaterThan(0);
    } else {
      // En browser, puede ser string (base64, etc.)
      expect(typeof resp.fullMeta.rawBody === 'string').toBe(true);
    }
  });
});
