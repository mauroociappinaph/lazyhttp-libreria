/**
 * Tipos comunes para cliente y servidor
 */

import type { RequestOptions } from '../../http.types';

// Tipos básicos de HTTP
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config?: unknown;
  error?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Tipos de autenticación
export interface AuthConfig {
  baseURL: string;
  loginEndpoint: string;
  logoutEndpoint: string;
  refreshTokenEndpoint: string;
  tokenStorage: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
  tokenKey: string;
  refreshTokenKey: string;
  userKey: string;
  autoRefresh: boolean;
  redirectOnUnauthorized: boolean;
  unauthorizedRedirectUrl: string;
}

export interface UserCredentials {
  username: string;
  password: string;
  [key: string]: unknown;
}

export interface AuthInfo {
  user: unknown;
  token: string;
  refreshToken?: string;
  expiresAt?: number;
}

// Configuración de proxy (solo disponible en server)
export interface ProxyConfig {
  protocol: 'http' | 'https' | 'socks4' | 'socks5';
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
}

// Configuración de streaming
export interface StreamConfig {
  onData?: (chunk: unknown) => void;
  onComplete?: () => void;
  onError?: (error: unknown) => void;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

// Configuración de caché
export interface CacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize?: number;
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  invalidateOnMutation?: boolean;
}

// Configuración de reintento automático
export interface RetryConfig {
  enabled: boolean;
  maxRetries: number;
  initialDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

export interface RetryOptions {
  enabled?: boolean;
  maxRetries?: number;
  initialDelay?: number;
  backoffFactor?: number;
}

// Configuración de métricas
export interface MetricsConfig {
  enabled: boolean;
  trackErrors?: boolean;
  trackPerformance?: boolean;
  trackCache?: boolean;
  sampleRate?: number;
}

/**
 * Configuración de inicialización para clientes HTTP
 */
export interface InitConfig {
  baseUrl?: string;
  frontendUrl?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  auth?: Partial<AuthConfig>;
  cache?: Partial<CacheConfig>;
  metrics?: Partial<MetricsConfig>;
  retry?: Partial<RetryConfig>;
  proxy?: ProxyConfig;
  transformRequest?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
  transformResponse?: ((data: unknown) => unknown) | Array<(data: unknown) => unknown>;
}

// Interfaz principal HTTP
export interface HttpImplementation {
  request<T = unknown>(method: HttpMethod, url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
  get<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  getAll<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T[]>>;
  getById<T = unknown>(url: string, id: string | number, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
  put<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
  patch<T = unknown>(url: string, data?: unknown, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  // Autenticación
  configureAuth(config: Partial<AuthConfig>): void;
  login(credentials: UserCredentials): Promise<AuthInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getAuthenticatedUser(): unknown | null;
  getAccessToken(): string | null;

  // Configuración
  initialize(config: Partial<InitConfig>): void;
  configureCaching(config: Partial<CacheConfig>): void;
  invalidateCache(pattern: string): void;
  invalidateCacheByTags(tags: string[]): void;
  configureMetrics(config: Partial<MetricsConfig>): void;
  trackActivity(type: string): void;
  getCurrentMetrics(): unknown;
}

export type { RequestOptions } from '../../http.types';
