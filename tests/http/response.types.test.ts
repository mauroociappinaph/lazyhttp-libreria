import { ApiResponse } from '../../http/types/core/response.types';

describe('ApiResponse<T> con fullMeta (FullResponseMetadata)', () => {
  it('debe aceptar y exponer correctamente los metadatos completos', () => {
    const response: ApiResponse<string> = {
      data: 'ok',
      error: null,
      status: 200,
      fullMeta: {
        requestHeaders: { 'X-Test': '1' },
        responseHeaders: { 'Content-Type': 'application/json' },
        timing: {
          requestStart: 100,
          responseEnd: 200
        },
        rawBody: '{"result":"ok"}',
        errorDetails: {
          description: 'No error',
          cause: '',
          solution: '',
        }
      }
    };
    expect(response.fullMeta).toBeDefined();
    expect(response.fullMeta?.requestHeaders['X-Test']).toBe('1');
    expect(response.fullMeta?.responseHeaders['Content-Type']).toBe('application/json');
    expect(response.fullMeta?.timing.requestStart).toBe(100);
    expect(response.fullMeta?.timing.responseEnd).toBe(200);
    expect(response.fullMeta?.rawBody).toBe('{"result":"ok"}');
    expect(response.fullMeta?.errorDetails?.description).toBe('No error');
  });
});
