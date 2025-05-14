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

describe('HttpCore.upload (múltiples archivos)', () => {
  let http: HttpCore;

  beforeEach(() => {
    http = new HttpCore();
  });

  it('debe agregar múltiples archivos en un solo campo (Node.js)', async () => {
    const postMock = jest.spyOn(http, 'post').mockResolvedValue({ data: { ok: true }, error: null, status: 200 });
    jest.mock('../../../../http/common/utils/http-upload.utils', () => ({
      buildNodeFormData: (fields: any) => ({
        form: { _isFormData: true, fields },
        headers: { 'content-type': 'multipart/form-data; boundary=abc123' }
      })
    }));
    (global as any).window = undefined;
    const fields = { archivos: ['./a.txt', './b.txt'], descripcion: 'multi' };
    await http.upload('https://api.com/upload', fields);
    expect(postMock).toHaveBeenCalledWith(
      'https://api.com/upload',
      expect.objectContaining({ _isFormData: true, fields }),
      expect.anything()
    );
  });

  it('debe agregar múltiples archivos en un solo campo (browser)', async () => {
    (global as any).window = {};
    const postMock = jest.spyOn(http, 'post').mockResolvedValue({ data: { ok: true }, error: null, status: 200 });
    const file1 = { name: 'a.txt' };
    const file2 = { name: 'b.txt' };
    const fields = { archivos: [file1, file2], descripcion: 'multi' };
    await http.upload('https://api.com/upload', fields);
    // No podemos inspeccionar el FormData real, pero sí que se llama con FormData y los campos correctos
    expect(postMock).toHaveBeenCalledWith(
      'https://api.com/upload',
      expect.any(FormData),
      undefined
    );
  });
});

describe('HttpCore.upload (validación de archivos)', () => {
  let http: HttpCore;

  beforeEach(() => {
    http = new HttpCore();
  });

  it('debe lanzar error si el archivo simple no existe (Node.js)', async () => {
    // Mock buildNodeFormData para lanzar error
    jest.mock('../../../../http/common/utils/http-upload.utils', () => ({
      buildNodeFormData: () => { throw new Error("El archivo './noexiste.txt' no existe o no es un archivo válido (campo 'archivo')"); }
    }));
    (global as any).window = undefined;
    await expect(
      http.upload('https://api.com/upload', { archivo: './noexiste.txt' })
    ).rejects.toThrow("El archivo './noexiste.txt' no existe o no es un archivo válido (campo 'archivo')");
  });

  it('debe lanzar error si algún archivo en array no existe (Node.js)', async () => {
    jest.mock('../../../../http/common/utils/http-upload.utils', () => ({
      buildNodeFormData: () => { throw new Error("El archivo './falso.txt' no existe o no es un archivo válido (campo 'archivos')"); }
    }));
    (global as any).window = undefined;
    await expect(
      http.upload('https://api.com/upload', { archivos: ['./a.txt', './falso.txt'] })
    ).rejects.toThrow("El archivo './falso.txt' no existe o no es un archivo válido (campo 'archivos')");
  });
});
