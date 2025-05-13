import { HttpConfigManager } from '../../../../http/client/managers/http-config-manager';
import { HttpPropertyManager } from '../../../../http/client/managers/http-property-manager';
import { httpConfiguration } from '../../../../http/http-configuration';

// Mock de las dependencias
jest.mock('../../../../http/http-configuration', () => ({
  httpConfiguration: {
    initialize: jest.fn().mockResolvedValue(undefined),
    configureCaching: jest.fn(),
    invalidateCache: jest.fn(),
    invalidateCacheByTags: jest.fn(),
    configureMetrics: jest.fn(),
    trackActivity: jest.fn(),
    getCurrentMetrics: jest.fn().mockReturnValue({ requestCount: 10 }),
    configureProxy: jest.fn()
  }
}));

jest.mock('../../../../http/client/managers/http-property-manager', () => ({
  HttpPropertyManager: jest.fn().mockImplementation(() => ({
    updateFromConfig: jest.fn()
  }))
}));

describe('HttpConfigManager', () => {
  let configManager: HttpConfigManager;
  let propertyManager: HttpPropertyManager;

  beforeEach(() => {
    // Crear mocks y manager para pruebas
    propertyManager = new HttpPropertyManager({} as any); // Mock del HttpCore
    configManager = new HttpConfigManager(propertyManager);

    // Limpiar mocks entre tests
    jest.clearAllMocks();
  });

  test('debería inicializar configuración correctamente', async () => {
    // Arrange
    const config = {
      baseUrl: 'https://api.ejemplo.com',
      timeout: 5000,
      headers: { 'X-API-Key': 'test-key' }
    };

    // Act
    await configManager.initialize(config);

    // Assert
    expect(httpConfiguration.initialize).toHaveBeenCalledWith(config);
    expect(propertyManager.updateFromConfig).toHaveBeenCalledWith({
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      retries: undefined,
      headers: config.headers
    });
  });

  test('debería configurar el sistema de caché', () => {
    // Arrange
    const cacheConfig = {
      enabled: true,
      ttl: 300,
      maxSize: 100
    };

    // Act
    configManager.configureCaching(cacheConfig);

    // Assert
    expect(httpConfiguration.configureCaching).toHaveBeenCalledWith(cacheConfig);
  });

  test('debería invalidar la caché por patrón', () => {
    // Arrange
    const pattern = '/api/users/*';

    // Act
    configManager.invalidateCache(pattern);

    // Assert
    expect(httpConfiguration.invalidateCache).toHaveBeenCalledWith(pattern);
  });

  test('debería invalidar la caché por etiquetas', () => {
    // Arrange
    const tags = ['user', 'profile'];

    // Act
    configManager.invalidateCacheByTags(tags);

    // Assert
    expect(httpConfiguration.invalidateCacheByTags).toHaveBeenCalledWith(tags);
  });

  test('debería configurar el sistema de métricas', () => {
    // Arrange
    const metricsConfig = {
      enabled: true,
      sampleRate: 0.1
    };

    // Act
    configManager.configureMetrics(metricsConfig);

    // Assert
    expect(httpConfiguration.configureMetrics).toHaveBeenCalledWith(metricsConfig);
  });

  test('debería registrar actividad para métricas', () => {
    // Act
    configManager.trackActivity('request');

    // Assert
    expect(httpConfiguration.trackActivity).toHaveBeenCalledWith('request');
  });

  test('debería obtener las métricas actuales', () => {
    // Act
    const metrics = configManager.getCurrentMetrics();

    // Assert
    expect(httpConfiguration.getCurrentMetrics).toHaveBeenCalled();
    expect(metrics).toEqual({ requestCount: 10 });
  });

  test('debería configurar el proxy', () => {
    // Arrange
    const proxyConfig = {
      host: 'proxy.example.com',
      port: 8080,
      url: 'http://proxy.example.com:8080'
    };

    // Act
    configManager.configureProxy(proxyConfig);

    // Assert
    expect(httpConfiguration.configureProxy).toHaveBeenCalledWith(proxyConfig);
  });
});
