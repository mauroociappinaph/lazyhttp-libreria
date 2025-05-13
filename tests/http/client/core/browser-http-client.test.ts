import { BrowserHttpClient } from '../../../../http/client/core/browser-http-client';
import axios from 'axios';

// Mock de axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BrowserHttpClient', () => {
  let httpClient: BrowserHttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    httpClient = new BrowserHttpClient();
    httpClient.initialize({
      baseUrl: 'https://api.ejemplo.com'
    });
  });

  test('debería ejecutar una petición GET exitosa', async () => {
    // Arrange
    const responseData = { id: 1, name: 'Test' };
    mockedAxios.request.mockResolvedValueOnce({
      data: responseData,
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    const response = await httpClient.get('/users/1');

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
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
    mockedAxios.request.mockResolvedValueOnce({
      data: responseData,
      status: 201,
      headers: {},
      config: {}
    });

    // Act
    const response = await httpClient.post('/users', requestData);

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.ejemplo.com/users',
      method: 'POST',
      data: requestData
    }));
    expect(response.data).toEqual(responseData);
    expect(response.status).toBe(201);
  });

  test('debería manejar errores de red', async () => {
    // Arrange
    const axiosError = {
      code: 'ECONNRESET',
      message: 'Connection reset',
      isAxiosError: true
    };

    mockedAxios.request.mockRejectedValueOnce(axiosError);

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
    const axiosError = {
      response: {
        status: 500,
        data: { message: errorMessage }
      },
      message: errorMessage,
      isAxiosError: true
    };

    mockedAxios.request.mockRejectedValueOnce(axiosError);

    // Act
    const response = await httpClient.get('/users/1');

    // Assert
    expect(response.status).toBe(500);
    expect(response.error).toBe(errorMessage);
    expect(response.data).toBe(null);
  });

  test('debería concatenar correctamente el endpoint con la URL base', async () => {
    // Arrange
    mockedAxios.request.mockResolvedValueOnce({
      data: {},
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    await httpClient.get('users/1'); // sin el slash inicial

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://api.ejemplo.com/users/1' // debe incluir el slash
    }));
  });

  test('debería incluir headers personalizados en la petición', async () => {
    // Arrange
    const customHeaders = {
      'X-Custom-Header': 'custom-value'
    };
    mockedAxios.request.mockResolvedValueOnce({
      data: {},
      status: 200,
      headers: {},
      config: {}
    });

    // Act
    await httpClient.get('/users', { headers: customHeaders });

    // Assert
    expect(mockedAxios.request).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining(customHeaders)
    }));
  });
});
