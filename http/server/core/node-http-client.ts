import { BaseHttpClient } from "../../common/core/base-http-client";
import {
  HttpMethod,
  ApiResponse,
  RequestOptions,
  AuthInfo,
  UserCredentials,
  ProxyConfig,
} from "../../types/core.types";
import { HttpUtils } from "../../common/utils/http-utils";
import axios, { isAxiosError, AxiosRequestConfig } from "axios";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import * as https from "https";

/**
 * Implementación del cliente HTTP para entorno Node.js
 * Extiende la base común añadiendo funcionalidades específicas del servidor
 */
export class NodeHttpClient extends BaseHttpClient {
  // Propiedades específicas de Node.js
  private tokenStorage: Record<string, string> = {};
  private cacheDirectory: string = path.join(process.cwd(), ".cache");
  private httpAgent: http.Agent = new http.Agent({ keepAlive: true });
  private httpsAgent: https.Agent = new https.Agent({ keepAlive: true });

  /**
   * Constructor específico para Node.js
   */
  constructor() {
    super();
    // Crear directorio de caché si no existe
    this.setupCacheDirectory();
  }

  /**
   * Hook para inicialización específica del entorno Node.js
   */
  protected onInitialize(config: any): void {
    // Inicialización específica de Node.js
    if (config.cacheDirectory) {
      this.cacheDirectory = config.cacheDirectory;
      this.setupCacheDirectory();
    }
  }

  /**
   * Sobrescribo el método protegido para usar los transformadores activos
   */
  protected async _requestWithTransforms<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    // Obtener los transformadores activos de la base
    const transformRequestFns = (this as any)._activeTransformRequest || [];
    const transformResponseFns = (this as any)._activeTransformResponse || [];

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

    // Configurar agentes y proxy si es necesario
    const requestConfig: AxiosRequestConfig = {
      method,
      url: urlWithParams,
      data,
      headers,
      timeout: options?.timeout || this.defaultTimeout,
      httpAgent: this.httpAgent,
      httpsAgent: this.httpsAgent,
    };

    // Configurar proxy si está definido
    if (this.proxyConfig) {
      const proxyAgent = this._createProxyAgent(this.proxyConfig);
      if (proxyAgent) {
        requestConfig.httpAgent = proxyAgent;
        requestConfig.httpsAgent = proxyAgent;
      }
    }

    // --- Transformar data antes de enviar (transformRequest) ---
    let requestData = data;
    if (transformRequestFns.length > 0) {
      for (const fn of transformRequestFns) {
        requestData = fn(requestData);
      }
    }

    try {
      // Ejecutar petición con axios
      const response = await axios.request<T>({
        ...requestConfig,
        data: requestData,
      });

      // Registrar métricas si están habilitadas
      if (this.metricsConfig.enabled) {
        this.trackActivity("request");
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

      // Formar respuesta estándar
      return {
        data: responseData,
        status: response.status,
        fullMeta: {
          responseHeaders: response.headers as Record<string, string>,
        },
        config: response.config,
        error: null,
      };
    } catch (error) {
      // Gestión de errores específica para axios
      if (isAxiosError(error)) {
        return {
          data: null as unknown as T,
          status: error.response?.status || 500,
          fullMeta: {
            responseHeaders:
              (error.response?.headers as Record<string, string>) || {},
          },
          error: error.response?.data?.message || error.message,
        };
      }

      // Error genérico
      return {
        data: null as unknown as T,
        status: 500,
        fullMeta: { responseHeaders: {} },
        error: this.parseErrorMessage(error),
      };
    }
  }

  /**
   * Crea un agente de proxy basado en la configuración
   */
  private _createProxyAgent(proxyConfig: ProxyConfig) {
    // En una implementación real, esto cargaría dinámicamente los módulos necesarios
    try {
      // Para HTTP/HTTPS proxy
      if (proxyConfig.protocol === "http" || proxyConfig.protocol === "https") {
        // En producción usar:
        // const HttpsProxyAgent = require('https-proxy-agent');

        const auth = proxyConfig.auth
          ? `${proxyConfig.auth.username}:${proxyConfig.auth.password}@`
          : "";

        const proxyUri = `${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`;

        // Simular creación del agente para este ejemplo
        console.log(`Creating HTTP/HTTPS proxy agent for ${proxyUri}`);
        return undefined; // En producción: return new HttpsProxyAgent(proxyUri);
      }

      // Para proxy SOCKS
      if (proxyConfig.protocol === "socks") {
        // En producción usar:
        // const SocksProxyAgent = require('socks-proxy-agent');

        const auth = proxyConfig.auth
          ? `${proxyConfig.auth.username}:${proxyConfig.auth.password}@`
          : "";

        const proxyUri = `${proxyConfig.protocol}://${auth}${proxyConfig.host}:${proxyConfig.port}`;

        // Simular creación del agente para este ejemplo
        console.log(`Creating SOCKS proxy agent for ${proxyUri}`);
        return undefined; // En producción: return new SocksProxyAgent(proxyUri);
      }
    } catch (error) {
      console.error("Error creating proxy agent:", error);
    }

    return undefined;
  }

  // Implementaciones específicas para Node.js

  /**
   * Inicia sesión con las credenciales proporcionadas
   */
  async login(credentials: UserCredentials): Promise<AuthInfo> {
    if (!this.authConfig.loginEndpoint) {
      throw new Error("No se ha configurado el endpoint de login");
    }

    try {
      const response = await this.post<AuthInfo>(
        this.authConfig.loginEndpoint,
        credentials
      );

      if (response.error || !response.data) {
        throw new Error(response.error || "Error de autenticación");
      }

      // Desestructurar solo las propiedades que se usan
      const { accessToken, refreshToken, user } = response.data;
      // La variable expiresAt no se usa, por lo que no la desestructuramos

      // Almacenar token y datos de usuario
      this._storeToken(this.authConfig.tokenKey || "token", accessToken);

      if (refreshToken && this.authConfig.refreshTokenKey) {
        this._storeToken(this.authConfig.refreshTokenKey, refreshToken);
      }

      if (
        user &&
        "userKey" in this.authConfig &&
        typeof this.authConfig.userKey === "string" &&
        this.authConfig.userKey
      ) {
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
    this._removeToken(this.authConfig.tokenKey || "token");

    if (this.authConfig.refreshTokenKey) {
      this._removeToken(this.authConfig.refreshTokenKey);
    }

    if (
      "userKey" in this.authConfig &&
      typeof this.authConfig.userKey === "string" &&
      this.authConfig.userKey
    ) {
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
    if (
      !(
        "userKey" in this.authConfig &&
        typeof this.authConfig.userKey === "string" &&
        this.authConfig.userKey
      )
    )
      return null;

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
    return this._getToken(this.authConfig.tokenKey || "token");
  }

  /**
   * Invalida caché por patrón
   */
  invalidateCache(pattern: string): void {
    if (!this.cacheConfig.enabled) return;

    try {
      const cacheFiles = this.getCacheFiles();

      // Filtrar archivos que coinciden con el patrón
      const matchingFiles = cacheFiles.filter((file) => file.includes(pattern));

      // Eliminar archivos que coinciden
      matchingFiles.forEach((file) => {
        const filePath = path.join(this.cacheDirectory, file);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error("Error al invalidar caché:", error);
    }
  }

  /**
   * Invalida caché por tags
   */
  invalidateCacheByTags(tags: string[]): void {
    if (!this.cacheConfig.enabled || !tags.length) return;

    try {
      const cacheFiles = this.getCacheFiles();

      cacheFiles.forEach((file) => {
        try {
          const filePath = path.join(this.cacheDirectory, file);
          const content = fs.readFileSync(filePath, "utf8");
          const cacheData = JSON.parse(content);

          // Si la entrada tiene tags que coinciden, eliminarla
          if (cacheData.tags && Array.isArray(cacheData.tags)) {
            const hasMatchingTag = tags.some((tag) =>
              cacheData.tags.includes(tag)
            );
            if (hasMatchingTag) {
              fs.unlinkSync(filePath);
            }
          }
        } catch {
          // Ignorar archivos inválidos
        }
      });
    } catch (error) {
      console.error("Error al invalidar caché por tags:", error);
    }
  }

  /**
   * Registra actividad para métricas
   */
  trackActivity(type: string): void {
    if (!this.metricsConfig.enabled) return;

    try {
      const metricsFile = path.join(this.cacheDirectory, "http_metrics.json");
      const currentMetrics = this.getCurrentMetrics();

      // Actualizar métricas según el tipo
      if (type === "request") {
        currentMetrics.requests = (currentMetrics.requests || 0) + 1;
      } else if (type === "error") {
        currentMetrics.errors = (currentMetrics.errors || 0) + 1;
      } else if (type === "cache_hit") {
        currentMetrics.cacheHits = (currentMetrics.cacheHits || 0) + 1;
      } else if (type === "cache_miss") {
        currentMetrics.cacheMisses = (currentMetrics.cacheMisses || 0) + 1;
      }

      // Guardar métricas actualizadas
      fs.writeFileSync(metricsFile, JSON.stringify(currentMetrics), "utf8");
    } catch {
      // Ignorar errores en métricas
    }
  }

  /**
   * Obtiene las métricas actuales
   */
  getCurrentMetrics(): any {
    try {
      const metricsFile = path.join(this.cacheDirectory, "http_metrics.json");

      if (fs.existsSync(metricsFile)) {
        const content = fs.readFileSync(metricsFile, "utf8");
        return JSON.parse(content);
      }
    } catch {
      // Ignorar errores
    }

    // Métricas por defecto
    return {
      requests: 0,
      errors: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  // Métodos privados específicos de Node.js

  /**
   * Configura el directorio de caché
   */
  private setupCacheDirectory(): void {
    if (!fs.existsSync(this.cacheDirectory)) {
      fs.mkdirSync(this.cacheDirectory, { recursive: true });
    }
  }

  /**
   * Obtiene la lista de archivos de caché
   */
  private getCacheFiles(): string[] {
    try {
      return fs
        .readdirSync(this.cacheDirectory)
        .filter((file) => file.startsWith("http_cache_"));
    } catch {
      return [];
    }
  }

  /**
   * Almacena un token en el almacenamiento configurado
   */
  private _storeToken(key: string, value: string): void {
    // En Node.js, se podría almacenar en disco para persistencia entre reinicios
    this.tokenStorage[key] = value;
  }

  /**
   * Obtiene un token del almacenamiento configurado
   */
  private _getToken(key: string): string | null {
    return this.tokenStorage[key] || null;
  }

  /**
   * Elimina un token del almacenamiento configurado
   */
  private _removeToken(key: string): void {
    delete this.tokenStorage[key];
  }

  /**
   * Decodifica un token JWT (específico para Node.js)
   */
  private _decodeToken(token: string): any {
    try {
      // En Node.js podemos usar Buffer en lugar de window.atob
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = Buffer.from(base64, "base64").toString("utf-8");

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

  /**
   * Implementación pública de request requerida por la clase base
   */
  async request<T>(
    url: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const method = options?.method || "GET";
    const data = options?.body;
    return this._requestWithTransforms<T>(method, url, data, options);
  }
}
