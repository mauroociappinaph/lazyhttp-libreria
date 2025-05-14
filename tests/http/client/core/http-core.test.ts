import { HttpCore } from '../../../../http/http-core';

describe('HttpCore.all', () => {
  let http: HttpCore;

  beforeEach(() => {
    http = new HttpCore();
  });

  it('debe devolver los datos de todas las respuestas exitosas', async () => {
    const urls = ['url/1', 'url/2', 'url/3'];
    const mockData = [
      { id: 1, nombre: 'A' },
      { id: 2, nombre: 'B' },
      { id: 3, nombre: 'C' }
    ];
    // Mockear get para devolver datos distintos según la URL
    jest.spyOn(http, 'get').mockImplementation((url: string) => {
      const idx = urls.indexOf(url);
      return Promise.resolve({ data: mockData[idx], error: null, status: 200 });
    });
    const resultado = await http.all(urls);
    expect(resultado).toEqual(mockData);
  });

  it('debe omitir respuestas con data null', async () => {
    const urls = ['url/1', 'url/2', 'url/3'];
    const mockData = [
      { id: 1, nombre: 'A' },
      null,
      { id: 3, nombre: 'C' }
    ];
    jest.spyOn(http, 'get').mockImplementation((url: string) => {
      const idx = urls.indexOf(url);
      return Promise.resolve({ data: mockData[idx], error: null, status: 200 });
    });
    const resultado = await http.all(urls);
    expect(resultado).toEqual([
      { id: 1, nombre: 'A' },
      { id: 3, nombre: 'C' }
    ]);
  });

  it('debe devolver un array vacío si no hay URLs', async () => {
    const resultado = await http.all([]);
    expect(resultado).toEqual([]);
  });
});

describe('HttpCore.upload', () => {
  let http: HttpCore;

  beforeEach(() => {
    http = new HttpCore();
  });

  it('debe construir el FormData y llamar a post con los headers correctos (Node.js)', async () => {
    // Mock de post para capturar argumentos
    const postMock = jest.spyOn(http, 'post').mockResolvedValue({ data: { ok: true }, error: null, status: 200 });
    // Mock dinámico de buildNodeFormData
    jest.mock('../../../../http/common/utils/http-upload.utils', () => ({
      buildNodeFormData: (fields: any) => ({
        form: { _isFormData: true, fields },
        headers: { 'content-type': 'multipart/form-data; boundary=abc123' }
      })
    }));
    // Forzamos entorno Node
    (global as any).window = undefined;
    const fields = { archivo: './ejemplo.txt', descripcion: 'Test' };
    const resp = await http.upload('https://api.com/upload', fields, { headers: { 'x-custom': '1' } });
    expect(postMock).toHaveBeenCalledWith(
      'https://api.com/upload',
      expect.objectContaining({ _isFormData: true, fields }),
      expect.objectContaining({ headers: expect.objectContaining({ 'content-type': expect.any(String), 'x-custom': '1' }) })
    );
    expect(resp.data).toEqual({ ok: true });
  });

  it('debe construir FormData nativo en browser', async () => {
    // Simula entorno browser
    (global as any).window = {};
    const postMock = jest.spyOn(http, 'post').mockResolvedValue({ data: { ok: true }, error: null, status: 200 });
    const fields = { archivo: 'file', descripcion: 'Test' };
    const resp = await http.upload('https://api.com/upload', fields);
    expect(postMock).toHaveBeenCalledWith(
      'https://api.com/upload',
      expect.any(FormData),
      undefined
    );
    expect(resp.data).toEqual({ ok: true });
  });
});
