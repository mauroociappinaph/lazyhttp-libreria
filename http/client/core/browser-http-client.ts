import { BaseHttpClient } from '../../common/core/base-http-client';
import { HttpMethod, ApiResponse, RequestOptions, AuthInfo, UserCredentials } from '../../common/types';
import { HttpUtils } from '../../common/utils/http-utils';
import axios, { isAxiosError } from 'axios';

/**
 * Implementación del cliente HTTP para navegadores
 * Extiende la base común añadiendo funcionalidades específicas del entorno
 */
export class BrowserHttpClient extends BaseHttpClient {
  // Propiedades específicas del navegador
  private tokenStorage: 'localStorage' | 'sessionStorage' | 'memory' = 'localStorage';

  /**
   * Implementación específica de request para navegador usando axios
   */
  async request<T>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Contador de intentos para retry
    let retryCount = 0;

    // Función interna para hacer la petición y manejar los reintentos
    const executeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        // URL completa (añadir baseUrl si es necesaria)
        const fullUrl = this.buildRequestUrl(url);

        // Preparar headers incluyendo autenticación si se requiere
        const headers = this.prepareHeaders(
          options?.headers || {},
          options?.withAuth !== undefined ? options.withAuth : false
        );

        // Añadir parámetros de query si existen
        const urlWithParams = options?.params
          ? HttpUtils.addQueryParams(fullUrl, options.params)
          : fullUrl;

        // --- Transformar data antes de enviar (transformRequest) ---
        let requestData = data;
        let requestTransformers = options?.transformRequest || this.transformRequest;

        if (!Array.isArray(requestTransformers)) {
          requestTransformers = [requestTransformers];
        }

        if (requestTransformers.length > 0) {
          for (const fn of requestTransformers) {
            if(fn) { // Asegurarse que la función existe
              requestData = fn(requestData);
            }
          }
        }

        // Ejecutar petición con axios
        const response = await axios.request<T>({
          method,
          url: urlWithParams,
          data: requestData,
          headers,
          timeout: options?.timeout || this.defaultTimeout
        });

        // Registrar métricas si están habilitadas
        if (this.metricsConfig.enabled) {
          this.trackActivity('request');
          if (this.metricsConfig.trackPerformance) {
            // Implementar tracking de tiempo de respuesta
          }
        }

        // --- Transformar data de respuesta (transformResponse) ---
        let responseData = response.data;
        if (this.transformResponse.length > 0) {
          for (const fn of this.transformResponse) {
            responseData = fn(responseData);
          }
        }

        // Formar respuesta estándar
        return {
          data: responseData,
          status: response.status,
          headers: response.headers as Record<string, string>,
          config: response.config
        };
      } catch (error) {
        // Gestión de errores específica para axios
        if (isAxiosError(error)) {
          // Si es un error 401 y hay token, intentar renovarlo
          if (error.response?.status === 401 && this.getAccessToken() && this.authConfig.autoRefresh) {
            try {
              // Implementación de renovación de token
              // ...

              // Reintentar petición con nuevo token
              return this.request(method, url, data, options);
            } catch (refreshError) {
              // Si falla el refresh, devolver error original
            }
          }

          const errorResponse = {
            data: null as unknown as T,
            status: error.response?.status || 500,
            headers: error.response?.headers as Record<string, string> || {},
            error: error.response?.data?.message || error.message,
            code: error.code
          };

          // Evaluar si se debe reintentar la petición
          if (this.shouldRetry(errorResponse, retryCount, options?.retryOptions)) {
            // Incrementar contador de intentos
            retryCount++;

            // Calcular tiempo de espera con backoff exponencial
            const delay = this.calculateRetryDelay(retryCount, options?.retryOptions);

            // Registrar intento fallido en métricas si están habilitadas
            if (this.metricsConfig.enabled) {
              this.trackActivity('retry');
            }

            // Esperar el tiempo calculado antes de reintentar
            await new Promise(resolve => setTimeout(resolve, delay));

            // Reintentar la petición
            return executeRequest();
          }

          return errorResponse;
        }

        // Error genérico
        const genericError = {
          data: null as unknown as T,
          status: 500,
          headers: {},
          error: this.parseErrorMessage(error),
          code: (error as any).code
        };

        // Evaluar si se debe reintentar la petición
        if (this.shouldRetry(genericError, retryCount, options?.retryOptions)) {
          // Incrementar contador de intentos
          retryCount++;

          // Calcular tiempo de espera con backoff exponencial
          const delay = this.calculateRetryDelay(retryCount, options?.retryOptions);

          // Registrar intento fallido en métricas si están habilitadas
          if (this.metricsConfig.enabled) {
            this.trackActivity('retry');
          }

          // Esperar el tiempo calculado antes de reintentar
          await new Promise(resolve => setTimeout(resolve, delay));

          // Reintentar la petición
          return executeRequest();
        }

        return genericError;
      }
    };

    // Iniciar el proceso de petición
    return executeRequest();
  }

  // Sobrescribo el método protegido para usar los transformadores activos
  protected async _requestWithTransforms<T>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    // Obtener los transformadores activos de la base
    const transformRequestFns = (this as any)._activeTransformRequest || [];
    const transformResponseFns = (this as any)._activeTransformResponse || [];

    // --- Transformar data antes de enviar (transformRequest) ---
    let requestData = data;
    if (transformRequestFns.length > 0) {
      for (const fn of transformRequestFns) {
        requestData = fn(requestData);
      }
    }

    // ... el resto igual que antes, pero usando requestData ...
    try {
      // URL completa (añadir baseUrl si es necesaria)
      const fullUrl = this.buildRequestUrl(url);
      const headers = this.prepareHeaders(
        options?.headers || {},
        options?.withAuth !== undefined ? options.withAuth : false
      );
      const urlWithParams = options?.params
        ? HttpUtils.addQueryParams(fullUrl, options.params)
        : fullUrl;
      const response = await axios.request<T>({
        method,
        url: urlWithParams,
        data: requestData,
        headers,
        timeout: options?.timeout || this.defaultTimeout
      });
      if (this.metricsConfig.enabled) {
        this.trackActivity('request');
        if (this.metricsConfig.trackPerformance) {
          // Implementar tracking de tiempo de respuesta
        }
      }
      // --- Transformar data de respuesta (transformResponse) ---
      let responseData = response.data;
      if (transformResponseFns.length > 0) {
        for (const fn of transformResponseFns) {
          responseData = fn(responseData);
        }
      }
      return {
        data: responseData,
        status: response.status,
        headers: response.headers as Record<string, string>,
        config: response.config
      };
    } catch (error) {
      // ... manejo de error igual ...
      throw error;
    }
  }

  // Implementaciones específicas para navegador

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    if (!this.authConfig.loginEndpoint) {
      throw new Error('No se ha configurado el endpoint de login');
    }

    try {
      const response = await this.post<AuthInfo>(
        this.authConfig.loginEndpoint,
        credentials
      );

      if (response.error || !response.data) {
        throw new Error(response.error || 'Error de autenticación');
      }

      const { token, refreshToken, user } = response.data;

      // Almacenar token y datos de usuario
      this._storeToken(this.authConfig.tokenKey || 'token', token);

      if (refreshToken && this.authConfig.refreshTokenKey) {
        this._storeToken(this.authConfig.refreshTokenKey, refreshToken);
      }

      if (user && this.authConfig.userKey) {
        this._storeToken(this.authConfig.userKey, JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cierra la sesión eliminando tokens
   */
  async logout(): Promise<void> {
    // Llamada al endpoint de logout si existe
    if (this.authConfig.logoutEndpoint) {
      try {
        await this.post(this.authConfig.logoutEndpoint, {}, { withAuth: true });
      } catch (error) {
        // Si falla, continuar con el logout local
      }
    }

    // Eliminar tokens localmente
    this._removeToken(this.authConfig.tokenKey || 'token');

    if (this.authConfig.refreshTokenKey) {
      this._removeToken(this.authConfig.refreshTokenKey);
    }

    if (this.authConfig.userKey) {
      this._removeToken(this.authConfig.userKey);
    }
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    // Verificar si el token ha expirado
    try {
      const decoded = this._decodeToken(token);
      if (decoded && decoded.exp) {
        return !this._isTokenExpired(decoded.exp);
      }
    } catch {
      // Si hay error al decodificar, asumir token inválido
      return false;
    }

    // Si tiene token válido, está autenticado
    return true;
  }

  /**
   * Obtiene el usuario autenticado
   */
  getAuthenticatedUser(): any | null {
    if (!this.authConfig.userKey) return null;

    try {
      const userData = this._getToken(this.authConfig.userKey);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el token de acceso
   */
  getAccessToken(): string | null {
    return this._getToken(this.authConfig.tokenKey || 'token');
  }

  /**
   * Invalida caché por patrón
   */
  invalidateCache(pattern: string): void {
    // Implementación específica para navegador
    // Usando localStorage o sessionStorage como caché
    if (!this.cacheConfig.enabled) return;

    try {
      const storage = this._getStorage();
      const keys = Object.keys(storage);

      // Filtrar claves que coinciden con el patrón
      const matchingKeys = keys.filter(key =>
        key.startsWith('http_cache_') &&
        key.includes(pattern)
      );

      // Eliminar entradas que coinciden
      matchingKeys.forEach(key => storage.removeItem(key));
    } catch (error) {
      console.error('Error al invalidar caché:', error);
    }
  }

  /**
   * Invalida caché por tags
   */
  invalidateCacheByTags(tags: string[]): void {
    if (!this.cacheConfig.enabled || !tags.length) return;

    try {
      const storage = this._getStorage();
      const keys = Object.keys(storage);

      // Filtrar claves de caché
      const cacheKeys = keys.filter(key => key.startsWith('http_cache_'));

      // Revisar cada entrada de caché
      cacheKeys.forEach(key => {
        try {
          const cacheData = JSON.parse(storage.getItem(key) || '{}');

          // Si la entrada tiene tags que coinciden, eliminarla
          if (cacheData.tags && Array.isArray(cacheData.tags)) {
            const hasMatchingTag = tags.some(tag => cacheData.tags.includes(tag));
            if (hasMatchingTag) {
              storage.removeItem(key);
            }
          }
        } catch {
          // Ignorar entradas inválidas
        }
      });
    } catch (error) {
      console.error('Error al invalidar caché por tags:', error);
    }
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string): void {
    if (!this.metricsConfig.enabled) return;

    // Implementación básica, almacenar en localStorage
    try {
      const metricsKey = 'http_metrics';
      const currentMetrics = this.getCurrentMetrics();

      // Actualizar métricas según el tipo
      if (type === 'request') {
        currentMetrics.requests = (currentMetrics.requests || 0) + 1;
      } else if (type === 'error') {
        currentMetrics.errors = (currentMetrics.errors || 0) + 1;
      } else if (type === 'cache_hit') {
        currentMetrics.cacheHits = (currentMetrics.cacheHits || 0) + 1;
      } else if (type === 'cache_miss') {
        currentMetrics.cacheMisses = (currentMetrics.cacheMisses || 0) + 1;
      }

      // Guardar métricas actualizadas
      localStorage.setItem(metricsKey, JSON.stringify(currentMetrics));
    } catch {
      // Ignorar errores en métricas
    }
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): any {
    try {
      const metricsKey = 'http_metrics';
      const metricsData = localStorage.getItem(metricsKey);

      if (metricsData) {
        return JSON.parse(metricsData);
      }
    } catch {
      // Ignorar errores
    }

    // Métricas por defecto
    return {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
  }

  // Métodos privados específicos del navegador

  /**
   * Almacena un token en el almacenamiento configurado
   */
  private _storeToken(key: string, value: string): void {
    const storage = this._getStorage();
    storage.setItem(key, value);
  }

  /**
   * Obtiene un token del almacenamiento configurado
   */
  private _getToken(key: string): string | null {
    const storage = this._getStorage();
    return storage.getItem(key);
  }

  /**
   * Elimina un token del almacenamiento configurado
   */
  private _removeToken(key: string): void {
    const storage = this._getStorage();
    storage.removeItem(key);
  }

  /**
   * Obtiene el objeto de almacenamiento según la configuración
   */
  private _getStorage(): Storage {
    if (this.tokenStorage === 'sessionStorage') {
      return sessionStorage;
    }

    return localStorage;
  }

  /**
   * Decodifica un token JWT
   */
  private _decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado
   */
  private _isTokenExpired(expiration: number): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return expiration < currentTime;
  }
}
