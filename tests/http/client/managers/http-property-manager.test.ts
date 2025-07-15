import { HttpPropertyManager } from '../../../../http/client/managers/http-property-manager';
import { httpConfiguration } from '../../../../http/http-configuration';
import { HttpCore } from '../../../../http/http-core';

// Mock de las dependencias
jest.mock('../../../../http/http-configuration', () => ({
  httpConfiguration: {
    baseUrl: undefined,
    frontendUrl: undefined,
    defaultTimeout: 30000,
    defaultRetries: 0,
    defaultHeaders: {},
    configureProxy: jest.fn(),
    configureStream: jest.fn()
  }
}));

describe('HttpPropertyManager', () => {
  let propertyManager: HttpPropertyManager;
  let mockCore: Partial<HttpCore>;

  beforeEach(() => {
    // Crear mock del HttpCore
    mockCore = {
      _baseUrl: undefined,
      _defaultTimeout: 30000,
      _defaultRetries: 0,
      _defaultHeaders: {}
    };

    // Crear instancia con el mock
    propertyManager = new HttpPropertyManager(mockCore as HttpCore);

    // Limpiar estado entre tests
    jest.clearAllMocks();
  });

  test('debería configurar y recuperar baseUrl correctamente', () => {
    // Arrange
    const url = 'https://api.ejemplo.com';

    // Act
    propertyManager.baseUrl = url;

    // Assert
    expect(propertyManager.baseUrl).toBe(url);
    expect(mockCore._baseUrl).toBe(url);
    expect(httpConfiguration.baseUrl).toBe(url);
  });

  test('debería configurar y recuperar frontendUrl correctamente', () => {
    // Arrange
    const url = 'https://frontend.ejemplo.com';

    // Act
    propertyManager.frontendUrl = url;

    // Assert
    expect(propertyManager.frontendUrl).toBe(url);
    expect(httpConfiguration.frontendUrl).toBe(url);
  });

  test('debería configurar y recuperar defaultTimeout correctamente', () => {
    // Arrange
    const timeout = 5000;

    // Act
    propertyManager.defaultTimeout = timeout;

    // Assert
    expect(propertyManager.defaultTimeout).toBe(timeout);
    expect(mockCore._defaultTimeout).toBe(timeout);
    expect(httpConfiguration.defaultTimeout).toBe(timeout);
  });

  test('debería configurar y recuperar defaultRetries correctamente', () => {
    // Arrange
    const retries = 3;

    // Act
    propertyManager.defaultRetries = retries;

    // Assert
    expect(propertyManager.defaultRetries).toBe(retries);
    expect(mockCore._defaultRetries).toBe(retries);
    expect(httpConfiguration.defaultRetries).toBe(retries);
  });

  test('debería configurar y recuperar defaultHeaders correctamente', () => {
    // Arrange
    const headers = { 'X-API-Key': 'test-key' };

    // Act
    propertyManager.defaultHeaders = headers;

    // Assert
    expect(propertyManager.defaultHeaders).toEqual(headers);
    expect(mockCore._defaultHeaders).toEqual(headers);
    expect(httpConfiguration.defaultHeaders).toEqual(headers);
  });

  test('debería configurar proxyConfig correctamente', () => {
    // Arrange
    const proxyConfig = { url: 'http://proxy.ejemplo.com', host: 'proxy.ejemplo.com', port: 8080 };

    // Act
    propertyManager.proxyConfig = proxyConfig;

    // Assert
    expect(httpConfiguration.configureProxy).toHaveBeenCalledWith(proxyConfig);
  });

  test('debería configurar streamConfig correctamente', () => {
    // Arrange
    const streamConfig = { enabled: true };

    // Act
    propertyManager.streamConfig = streamConfig;

    // Assert
    expect(httpConfiguration.configureStream).toHaveBeenCalledWith(streamConfig);
  });

  test('debería sincronizar la configuración del core correctamente', () => {
    // Arrange - Configuración previa
    httpConfiguration.baseUrl = 'https://api.test.com';
    httpConfiguration.defaultTimeout = 10000;
    httpConfiguration.defaultRetries = 2;
    httpConfiguration.defaultHeaders = { 'Content-Type': 'application/json' };

    // Act
    propertyManager.syncCoreSettings();

    // Assert
    expect(mockCore._baseUrl).toBe(httpConfiguration.baseUrl);
    expect(mockCore._defaultTimeout).toBe(httpConfiguration.defaultTimeout);
    expect(mockCore._defaultRetries).toBe(httpConfiguration.defaultRetries);
    expect(mockCore._defaultHeaders).toEqual(httpConfiguration.defaultHeaders);
  });

  test('debería actualizar la configuración desde un objeto', () => {
    // Arrange
    const config = {
      baseUrl: 'https://api.nueva.com',
      timeout: 15000,
      retries: 3,
      headers: { 'X-Custom': 'value' }
    };

    // Act
    propertyManager.updateFromConfig(config);

    // Assert
    expect(propertyManager.baseUrl).toBe(config.baseUrl);
    expect(propertyManager.defaultTimeout).toBe(config.timeout);
    expect(propertyManager.defaultRetries).toBe(config.retries);
    // Headers deberían combinar los existentes con los nuevos
    expect(propertyManager.defaultHeaders['X-Custom']).toBe('value');
  });
});
