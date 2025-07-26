/**
 * Servicios centralizados para HTTPLazy
 * Eliminan la duplicación de código entre diferentes implementaciones de clientes HTTP
 */

import { AuthService, type IAuthService } from './auth.service';
import { CacheService, type ICacheService } from './cache.service';
import { MetricsService, type IMetricsService } from './metrics.service';

export { AuthService, type IAuthService } from './auth.service';
export { CacheService, type ICacheService } from './cache.service';
export { MetricsService, type IMetricsService, type MetricsData } from './metrics.service';

/**
 * Interfaz para el contenedor de servicios
 * Permite inyección de dependencias y composición
 */
export interface ServiceContainer {
  authService: IAuthService;
  cacheService: ICacheService;
  metricsService: IMetricsService;
}

/**
 * Factory para crear servicios según el contexto
 */
export class ServiceFactory {
  /**
   * Crea servicios para el contexto de navegador
   */
  static createBrowserServices(
    authManager: any,
    cacheManager: any,
    metricsConfig: any
  ): ServiceContainer {
    return {
      authService: new AuthService(authManager),
      cacheService: new CacheService(cacheManager),
      metricsService: new MetricsService(metricsConfig)
    };
  }

  /**
   * Crea servicios para el contexto de Node.js
   */
  static createNodeServices(
    authManager: any,
    configManager: any,
    metricsConfig: any
  ): ServiceContainer {
    return {
      authService: new AuthService(authManager),
      cacheService: new CacheService(configManager),
      metricsService: new MetricsService(metricsConfig, configManager)
    };
  }
}
