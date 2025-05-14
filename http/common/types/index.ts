/**
 * Tipos comunes para cliente y servidor
 */

import type { RequestOptions } from '../../types/http.types';

// Tipos básicos de HTTP
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
  config?: any;
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
  [key: string]: any;
}

export interface AuthInfo {
  user: any;
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
  onData?: (chunk: any) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
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

// Interfaz principal HTTP
export interface HttpImplementation {
  request<T = any>(method: HttpMethod, url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
  getAll<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T[]>>;
  getById<T = any>(url: string, id: string | number, options?: RequestOptions): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
  delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;

  // Autenticación
  configureAuth(config: Partial<AuthConfig>): void;
  login(credentials: UserCredentials): Promise<AuthInfo>;
  logout(): Promise<void>;
  isAuthenticated(): boolean;
  getAuthenticatedUser(): any | null;
  getAccessToken(): string | null;

  // Configuración
  initialize(config: any): void;
  configureCaching(config: Partial<CacheConfig>): void;
  invalidateCache(pattern: string): void;
  invalidateCacheByTags(tags: string[]): void;
  configureMetrics(config: Partial<MetricsConfig>): void;
  trackActivity(type: string): void;
  getCurrentMetrics(): any;
}

export type { RequestOptions } from '../../types/http.types';
