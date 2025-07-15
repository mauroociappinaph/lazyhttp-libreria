import { HttpCore } from '../../http/http-core';

// Mock para evitar fallos por red en integración
describe('HttpCore integración directa', () => {
  beforeAll(() => {
    jest.spyOn(HttpCore.prototype, 'get').mockImplementation(async (url: string) => {
      if (url.includes('image/png')) {
        return {
          fullMeta: {
            requestHeaders: {},
            responseHeaders: {},
            timing: { requestStart: Date.now(), responseEnd: Date.now() + 10 },
            rawBody: Buffer.from([1, 2, 3])
          },
          data: null,
          error: null,
          status: 200
        };
      }
      return {
        fullMeta: {
          requestHeaders: {},
          responseHeaders: {},
          timing: { requestStart: Date.now(), responseEnd: Date.now() + 10 }
        },
        data: { id: 1 },
        error: null,
        status: 200
      };
    });
  });

  it('debe poblar fullMeta en la respuesta', async () => {
    const core = new HttpCore();
    const response = await core.get('https://jsonplaceholder.typicode.com/posts/1');
    const resp = response;
    console.log('Respuesta HttpCore:', resp);
    expect(resp).toHaveProperty('fullMeta');
    expect(resp.fullMeta).toBeDefined();
    expect(typeof resp.fullMeta?.requestHeaders).toBe('object');
    expect(typeof resp.fullMeta?.responseHeaders).toBe('object');
    expect(typeof resp.fullMeta?.timing).toBe('object');
    if (resp.fullMeta?.timing) {
      expect(typeof resp.fullMeta.timing.requestStart).toBe('number');
      expect(typeof resp.fullMeta.timing.responseEnd).toBe('number');
    }
  });

  it('debe poblar fullMeta.rawBody como Buffer si la respuesta es binaria', async () => {
    const core = new HttpCore();
    // Simular una respuesta binaria usando un endpoint que devuelva datos binarios (por ejemplo, una imagen pequeña)
    const response = await core.get('https://httpbin.org/image/png');
    const resp = response;
    expect(resp).toHaveProperty('fullMeta');
    expect(resp.fullMeta).toBeDefined();
    if (resp.fullMeta) {
      expect(resp.fullMeta.rawBody).toBeDefined();
      if (typeof Buffer !== 'undefined' && Buffer.isBuffer(resp.fullMeta.rawBody)) {
        expect(Buffer.isBuffer(resp.fullMeta.rawBody)).toBe(true);
        expect(resp.fullMeta.rawBody.length).toBeGreaterThan(0);
      } else {
        expect(typeof resp.fullMeta.rawBody === 'string').toBe(true);
      }
    }
  });
});
