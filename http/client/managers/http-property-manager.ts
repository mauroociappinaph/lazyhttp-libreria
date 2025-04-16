import { HttpCore } from '../../http-core';
import { ProxyConfig, StreamConfig } from '../../http.types';
import { httpConfiguration } from '../../http-configuration';

/**
 * PropertyManager - Responsable de gestionar las propiedades de configuración del cliente HTTP
 * Aplicando el principio de responsabilidad única (SRP) para separar la gestión de propiedades
 * de las operaciones HTTP.
 */
export class HttpPropertyManager {
  constructor(private core: HttpCore) {}

  get baseUrl(): string | undefined {
    return httpConfiguration.baseUrl;
  }

  set baseUrl(url: string | undefined) {
    httpConfiguration.baseUrl = url;
    this.core._baseUrl = url;
  }

  get frontendUrl(): string | undefined {
    return httpConfiguration.frontendUrl;
  }

  set frontendUrl(url: string | undefined) {
    httpConfiguration.frontendUrl = url;
  }

  get defaultTimeout(): number {
    return httpConfiguration.defaultTimeout;
  }

  set defaultTimeout(timeout: number) {
    httpConfiguration.defaultTimeout = timeout;
    this.core._defaultTimeout = timeout;
  }

  get defaultRetries(): number {
    return httpConfiguration.defaultRetries;
  }

  set defaultRetries(retries: number) {
    httpConfiguration.defaultRetries = retries;
    this.core._defaultRetries = retries;
  }

  get defaultHeaders(): Record<string, string> {
    return httpConfiguration.defaultHeaders;
  }

  set defaultHeaders(headers: Record<string, string>) {
    httpConfiguration.defaultHeaders = headers;
    this.core._defaultHeaders = headers;
  }

  get proxyConfig(): ProxyConfig | undefined {
    return httpConfiguration.proxyConfig;
  }

  set proxyConfig(config: ProxyConfig | undefined) {
    if (config) {
      httpConfiguration.configureProxy(config);
    }
  }

  get streamConfig(): StreamConfig | undefined {
    return httpConfiguration.streamConfig;
  }

  set streamConfig(config: StreamConfig | undefined) {
    if (config) {
      httpConfiguration.configureStream(config);
    }
  }

  /**
   * Sincroniza la configuración del core con la configuración global
   */
  syncCoreSettings(): void {
    this.core._baseUrl = httpConfiguration.baseUrl;
    this.core._defaultTimeout = httpConfiguration.defaultTimeout;
    this.core._defaultRetries = httpConfiguration.defaultRetries;
    this.core._defaultHeaders = {...httpConfiguration.defaultHeaders};
  }

  /**
   * Actualiza las propiedades desde un objeto de configuración
   */
  updateFromConfig(config?: {
    baseUrl?: string,
    timeout?: number,
    retries?: number,
    headers?: Record<string, string>
  }): void {
    if (config?.baseUrl) {
      this.baseUrl = config.baseUrl;
    }

    if (config?.timeout) {
      this.defaultTimeout = config.timeout;
    }

    if (config?.retries !== undefined) {
      this.defaultRetries = config.retries;
    }

    if (config?.headers) {
      this.defaultHeaders = {...this.defaultHeaders, ...config.headers};
    }
  }
}
