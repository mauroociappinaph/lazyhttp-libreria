import axios, { AxiosRequestConfig } from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { ProxyConfig, RequestOptions, StreamConfig } from './http.types';
import { prepareHeaders } from './http-helpers';

/**
 * Clase que maneja las operaciones de streaming HTTP
 */
export class HttpStreamingManager {
  private defaultStreamConfig?: StreamConfig;
  private proxyConfig?: ProxyConfig;
  private baseUrl?: string;
  private defaultTimeout: number = 10000;

  /**
   * Configura las opciones por defecto para streaming
   */
  configure(config: {
    streamConfig?: StreamConfig,
    proxyConfig?: ProxyConfig,
    baseUrl?: string,
    timeout?: number
  }): void {
    if (config.streamConfig) {
      this.defaultStreamConfig = config.streamConfig;
    }
    if (config.proxyConfig) {
      this.proxyConfig = config.proxyConfig;
    }
    if (config.baseUrl) {
      this.baseUrl = config.baseUrl;
    }
    if (config.timeout) {
      this.defaultTimeout = config.timeout;
    }
  }

  /**
   * Ejecuta una petición HTTP en modo streaming
   */
  async stream<T>(endpoint: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<ReadableStream<T>> {
    const streamConfig: StreamConfig = {
      enabled: true,
      chunkSize: 8192,
      ...this.defaultStreamConfig,
      ...options.stream
    };

    if (!streamConfig.enabled) {
      throw new Error('Streaming no está habilitado para esta petición');
    }

    const proxyConfig = options.proxy || this.proxyConfig;
    const httpsAgent = this.createProxyAgent(proxyConfig);

    // Si se especifica rejectUnauthorized como false, desactivamos la verificación de certificados
    if (proxyConfig?.rejectUnauthorized === false) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }

    const axiosConfig: AxiosRequestConfig = {
      method: 'GET',
      url: this.buildUrl(endpoint),
      responseType: 'stream',
      headers: this.prepareHeaders(options),
      timeout: options.timeout || this.defaultTimeout,
      proxy: false, // Desactivamos el proxy de axios para usar nuestro propio agente
      httpsAgent
    };

    try {
      const response = await axios(axiosConfig);
      const stream = response.data;

      if (streamConfig.onChunk) {
        stream.on('data', (chunk: any) => {
          streamConfig.onChunk!(chunk);
        });
      }

      if (streamConfig.onEnd) {
        stream.on('end', () => {
          streamConfig.onEnd!();
        });
      }

      if (streamConfig.onError) {
        stream.on('error', (error: Error) => {
          streamConfig.onError!(error);
        });
      }

      return stream;
    } catch (error) {
      if (streamConfig.onError) {
        streamConfig.onError(error as Error);
      }
      throw error;
    } finally {
      // Restaurar la configuración de verificación de certificados
      if (proxyConfig?.rejectUnauthorized === false) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
      }
    }
  }

  /**
   * Crea un agente proxy según la configuración
   */
  private createProxyAgent(proxyConfig?: ProxyConfig) {
    if (!proxyConfig) return undefined;

    const { url, protocol = 'http', auth, rejectUnauthorized = false } = proxyConfig;
    const proxyUrl = new URL(url);

    if (auth) {
      proxyUrl.username = auth.username;
      proxyUrl.password = auth.password;
    }

    const proxyString = proxyUrl.toString();

    // Para SOCKS, usamos la URL directamente
    if (protocol === 'socks') {
      return new SocksProxyAgent(proxyString);
    }

    // Para HTTPS, configuramos las opciones específicas
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = rejectUnauthorized ? '1' : '0';
    return new HttpsProxyAgent(proxyString);
  }

  /**
   * Construye la URL completa
   */
  private buildUrl(endpoint: string): string {
    return this.baseUrl ? `${this.baseUrl}${endpoint}` : endpoint;
  }

  /**
   * Prepara las cabeceras de la petición
   */
  private prepareHeaders(options: RequestOptions): Record<string, string> {
    return prepareHeaders(options.headers || {}, options.withAuth || false);
  }
}

// Exportar una instancia única
export const streamingManager = new HttpStreamingManager();
