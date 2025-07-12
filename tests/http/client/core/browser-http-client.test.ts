import { BrowserHttpClient } from '../../../../http/client/core/browser-http-client';
import axios, { AxiosError, InternalAxiosRequestConfig, isAxiosError } from 'axios';

// Mock solo del método request de axios
jest.spyOn(axios, 'request');

describe('BrowserHttpClient', () => {
  let httpClient: BrowserHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    httpClient = new BrowserHttpClient({ baseUrl: 'https://api.ejemplo.com' });
  });

  test('debería ejecutar una petición GET exitosa', async () => {
    // Arrange
    const responseData = { id: 1, name: 'Test' };
    (axios.request as jest.Mock).mockResolvedValueOnce({
      data: responseData,
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    const response = await httpClient.get('/users/1');

    // Assert
    expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.ejemplo.com/users/1',
      method: 'GET'
    }));
    expect(response.data).toEqual(responseData);
    expect(response.status).toBe(200);
    expect(response.error).toBe(undefined);
  });

  test('debería ejecutar una petición POST exitosa', async () => {
    // Arrange
    const requestData = { name: 'New User' };
    const responseData = { id: 1, name: 'New User' };
    (axios.request as jest.Mock).mockResolvedValueOnce({
      data: responseData,
      status: 201,
      headers: {},
      config: {}
    });

    // Act
    const response = await httpClient.post('/users', requestData);

    // Assert
    expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.ejemplo.com/users',
      method: 'POST',
      data: requestData
    }));
    expect(response.data).toEqual(responseData);
    expect(response.status).toBe(201);
  });

  test('debería manejar errores de red', async () => {
    // Arrange
    const axiosError = new AxiosError(
      'Connection reset',
      'ECONNRESET',
      { headers: {} } as InternalAxiosRequestConfig<any>,
      {},
      undefined
    );
    axiosError.toJSON = () => ({});
    console.log('isAxiosError:', isAxiosError(axiosError));

    (axios.request as jest.Mock).mockRejectedValueOnce(axiosError);

    // Act
    const response = await httpClient.get('/users/1');

    // Assert
    expect(response.status).toBe(500);
    expect(response.error).toBe('Connection reset');
    expect(response.data).toBe(null);
  });

  test('debería manejar errores de servidor', async () => {
    // Arrange
    const errorMessage = 'Request failed with status code 500';
    const axiosError = new AxiosError(
      errorMessage,
      undefined,
      { headers: {} } as InternalAxiosRequestConfig<any>,
      {},
      {
        status: 500,
        data: { message: errorMessage },
        headers: {},
        config: { headers: {} as any }, // fix: headers tipado
        statusText: '', // fix: requerido por AxiosResponse
      }
    );
    axiosError.toJSON = () => ({});

    (axios.request as jest.Mock).mockRejectedValueOnce(axiosError);

    // Act
    const response = await httpClient.get('/users/1');

    // Assert
    expect(response.status).toBe(500);
    expect(response.error).toBe(errorMessage);
    expect(response.data).toBe(null);
  });

  test('debería concatenar correctamente el endpoint con la URL base', async () => {
    // Arrange
    (axios.request as jest.Mock).mockResolvedValueOnce({
      data: {},
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    await httpClient.get('users/1'); // sin el slash inicial

    // Assert
    expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.ejemplo.com/users/1' // debe incluir el slash
    }));
  });

  test('debería incluir headers personalizados en la petición', async () => {
    // Arrange
    const customHeaders = {
      'X-Custom-Header': 'custom-value'
    };
    (axios.request as jest.Mock).mockResolvedValueOnce({
      data: {},
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    await httpClient.get('/users', { headers: customHeaders });

    // Assert
    expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining(customHeaders)
    }));
  });
});
