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
