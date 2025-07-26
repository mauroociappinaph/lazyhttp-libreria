/**
 * Tipos comunes para cliente y servidor
 */

// Eliminar todas las definiciones duplicadas de tipos y dejar solo la reexportación centralizada:
export type {
  RequestOptions,
  ApiResponse,
  HttpMethod,
  AuthConfig,
  UserCredentials,
  AuthInfo,
  ProxyConfig,
  StreamConfig,
  CacheConfig,
  MetricsConfig,
  HttpClient,
} from "../../types/core.types";
